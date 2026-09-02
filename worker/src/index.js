const firebaseCertificates = new Map();
const allowedOrigins = new Set([
    'http://localhost:5174',
    'https://utilitypro.web.app',
]);
const PROFILE_COLLECTION = 'user';

function corsHeaders(request) {
    const origin = request.headers.get('Origin');
    if (!origin || !allowedOrigins.has(origin)) {
        return {};
    }

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        Vary: 'Origin',
    };
}

function jsonResponse(request, env, body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(request),
        },
    });
}

function getTokenFromHeader(request) {
    const authorization = request.headers.get('Authorization') || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
}

function base64UrlDecode(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded = padding === 0 ? normalized : normalized + '='.repeat(4 - padding);
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function decodeJson(value) {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(value)));
}

async function getFirebaseCertificate(kid) {
    const cachedCertificate = firebaseCertificates.get(kid);
    if (cachedCertificate) return cachedCertificate;

    const response = await fetch(
        'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
    );
    if (!response.ok) throw new Error('Unable to load Firebase signing keys');

    const keySet = await response.json();
    const jwk = keySet.keys?.find((key) => key.kid === kid);
    if (!jwk) throw new Error('Unknown Firebase signing key');

    const publicKey = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );
    firebaseCertificates.set(kid, publicKey);
    return publicKey;
}

async function verifyFirebaseToken(token, env) {
    if (!env.FIREBASE_PROJECT_ID) throw new Error('Firebase project is not configured');

    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid Firebase ID token');

    const [headerPart, payloadPart, signaturePart] = parts;
    const header = decodeJson(headerPart);
    const payload = decodeJson(payloadPart);
    const now = Math.floor(Date.now() / 1000);

    if (header.alg !== 'RS256' || !header.kid) throw new Error('Invalid token header');
    if (payload.aud !== env.FIREBASE_PROJECT_ID) throw new Error('Invalid token audience');
    if (payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`) {
        throw new Error('Invalid token issuer');
    }
    if (!payload.sub || payload.sub !== payload.user_id || payload.exp <= now) {
        throw new Error('Invalid token claims');
    }

    const publicKey = await getFirebaseCertificate(header.kid);
    const valid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        base64UrlDecode(signaturePart),
        new TextEncoder().encode(`${headerPart}.${payloadPart}`)
    );

    if (!valid) throw new Error('Invalid token signature');
    return payload;
}

async function createImageKitSignature(token, expire, privateKey) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(privateKey),
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(`${token}${expire}`)
    );

    return Array.from(new Uint8Array(signature), (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('');
}

async function getProfileDocument(uid, firebaseToken, env) {
    const documentPath = `${PROFILE_COLLECTION}/${encodeURIComponent(uid)}`;
    const documentUrl = new URL(
        `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/${documentPath}`
    );
    const response = await fetch(documentUrl, {
        headers: { Authorization: `Bearer ${firebaseToken}` },
    });

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Unable to read profile document');
    return response.json();
}

export function getProfileFileId(document) {
    const fields = document?.fields;
    const nestedFields = fields?.profilePicture?.mapValue?.fields;
    const nestedFileId = nestedFields?.fileId?.stringValue;
    const topLevelFileId = fields?.fileId?.stringValue;

    if (typeof nestedFileId === 'string' && nestedFileId.length > 0) {
        return { fileId: nestedFileId, source: 'profilePicture.fileId' };
    }

    if (typeof topLevelFileId === 'string' && topLevelFileId.length > 0) {
        return { fileId: topLevelFileId, source: 'fileId' };
    }

    return { fileId: null, source: null };
}

async function deleteImageKitFile(fileId, env) {
    const response = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Basic ${btoa(`${env.IMAGEKIT_PRIVATE_KEY}:`)}`,
            },
        }
    );

    if (!response.ok) throw new Error(`ImageKit returned status ${response.status}`);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (!env.FRONTEND_ORIGIN) {
            return new Response('Worker is not configured', { status: 500 });
        }

        if (request.method === 'OPTIONS') {
            if (!allowedOrigins.has(request.headers.get('Origin'))) {
                return new Response(null, { status: 403 });
            }
            return new Response(null, {
                status: 204,
                headers: corsHeaders(request),
            });
        }

        if (url.pathname === '/api/health' && request.method === 'GET') {
            return jsonResponse(request, env, {
                ok: true,
                service: 'utilitypro-imagekit-worker',
            });
        }

        if (request.method !== 'POST') {
            return jsonResponse(request, env, { error: 'Method not allowed' }, 405);
        }

        const firebaseIdToken = getTokenFromHeader(request);
        if (!firebaseIdToken) {
            return jsonResponse(request, env, { error: 'Missing Firebase bearer token' }, 401);
        }

        let decodedUser;
        try {
            decodedUser = await verifyFirebaseToken(firebaseIdToken, env);
        } catch (error) {
            console.error('Firebase token verification failed:', error.message);
            return jsonResponse(request, env, { error: 'Unauthorized' }, 401);
        }

        if (url.pathname === '/api/imagekit/auth') {
            if (!env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_PUBLIC_KEY) {
                return jsonResponse(request, env, { error: 'ImageKit is not configured' }, 500);
            }

            const authToken = crypto.randomUUID();
            const expire = Math.floor(Date.now() / 1000) + 300;
            const signature = await createImageKitSignature(
                authToken,
                expire,
                env.IMAGEKIT_PRIVATE_KEY
            );

            return jsonResponse(request, env, {
                token: authToken,
                signature,
                expire,
                publicKey: env.IMAGEKIT_PUBLIC_KEY,
                uid: decodedUser.user_id,
            });
        }

        if (url.pathname === '/api/imagekit/delete') {
            if (!env.IMAGEKIT_PRIVATE_KEY) {
                return jsonResponse(request, env, { error: 'ImageKit is not configured' }, 500);
            }

            const payload = await request.json().catch(() => ({}));
            const fileId = payload.fileId;

            if (!fileId || typeof fileId !== 'string') {
                return jsonResponse(request, env, { error: 'Missing ImageKit fileId' }, 400);
            }

            try {
                const authenticatedUid = decodedUser.sub;
                const documentPath = `${PROFILE_COLLECTION}/${authenticatedUid}`;
                const profileDocument = await getProfileDocument(
                    authenticatedUid,
                    firebaseIdToken,
                    env
                );
                const storedFile = getProfileFileId(profileDocument);

                console.log('ImageKit ownership check:', {
                    uid: authenticatedUid,
                    documentPath,
                    requestedFileId: fileId,
                    storedFileId: storedFile.fileId,
                    storedFileSource: storedFile.source,
                });

                if (!storedFile.fileId || storedFile.fileId !== fileId) {
                    return jsonResponse(request, env, { error: 'File does not belong to user' }, 403);
                }

                await deleteImageKitFile(fileId, env);
                return jsonResponse(request, env, { success: true });
            } catch (error) {
                console.error('ImageKit deletion failed:', error.message);
                return jsonResponse(request, env, { error: 'ImageKit delete failed' }, 500);
            }
        }

        return jsonResponse(request, env, { error: 'Not found' }, 404);
    },
};
