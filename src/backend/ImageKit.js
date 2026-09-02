import { auth } from "./Firebase";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_API_BASE_URL =
    import.meta.env.VITE_IMAGEKIT_API_URL || "";

async function getAuthHeaders() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        throw new Error("No authenticated user found.");
    }

    const token = await currentUser.getIdToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function getWorkerUrl(path) {
    if (!IMAGEKIT_API_BASE_URL) {
        throw new Error(
            "Missing VITE_IMAGEKIT_API_URL. Set your Cloudflare Worker URL in the frontend environment."
        );
    }

    return `${IMAGEKIT_API_BASE_URL.replace(/\/$/, "")}${path}`;
}

export async function getImageKitUploadAuth() {
    const headers = await getAuthHeaders();

    const response = await fetch(getWorkerUrl("/api/imagekit/auth"), {
        method: "POST",
        headers,
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get ImageKit upload auth.");
    }

    return response.json();
}

export async function uploadProfilePictureToImageKit(file, uid) {
    const authParams = await getImageKitUploadAuth();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${Date.now()}_${file.name}`);
    formData.append("folder", `/profile-pictures/${uid}/`);
    formData.append("publicKey", authParams.publicKey);
    formData.append("token", authParams.token);
    formData.append("signature", authParams.signature);
    formData.append("expire", String(authParams.expire));
    formData.append("useUniqueFileName", "true");

    const response = await fetch(IMAGEKIT_UPLOAD_URL, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "ImageKit upload failed.");
    }

    return response.json();
}

export async function deleteImageKitFile(fileId) {
    const headers = await getAuthHeaders();

    const response = await fetch(getWorkerUrl("/api/imagekit/delete"), {
        method: "POST",
        headers,
        body: JSON.stringify({ fileId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "ImageKit delete failed.");
    }

    return response.json();
}
