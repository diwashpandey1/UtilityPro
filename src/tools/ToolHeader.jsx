import { BadgeCheck } from "lucide-react"; // Or any icon for trending

function ToolHeader({ tool }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
          <tool.icon size={28} />
        </div>

        {/* Title + description */}
        <div>
          <h1 className="text-2xl font-semibold">{tool.name}</h1>
          <p className="text-gray-600">{tool.description}</p>

          {/* Tags */}
          <div className="flex gap-3 mt-3">
            {/* Category Tag */}
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
              {tool.category}
            </span>

            {/* Trending Tag */}
            {tool.isTrending && (
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm flex items-center gap-1">
                <BadgeCheck size={14} /> Trending
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ToolHeader;
