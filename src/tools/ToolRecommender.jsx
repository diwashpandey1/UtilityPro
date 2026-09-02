import { Link } from "react-router-dom";
import { tools } from "../data/ToolsData"; // Assuming ToolsData is correctly defined

/**
 * Enhanced Tool Recommender Component
 * * Features:
 * 1. Accepts 'currentToolSlug' as a prop to identify the page being viewed.
 * 2. Excludes the current tool from the recommendation list.
 * 3. Uses a combination of 'isTrending' and a fallback to select 3 unique tools.
 * 4. Improved styling for a more noticeable component.
 * * @param {string} currentToolSlug - The slug of the tool currently being displayed.
 */
function ToolRecommender({ currentToolSlug }) {
  
  // 1. Filter out the current tool and non-trending tools
  const availableTools = tools.filter(
    (tool) => tool.slug !== currentToolSlug
  );

  // 2. Prioritize trending tools
  const trending = availableTools.filter((tool) => tool.isTrending);
  
  // 3. Fallback to general tools if trending list is too short
  const nonTrending = availableTools.filter((tool) => !tool.isTrending);

  // 4. Combine and slice to get exactly 3 recommendations
  const recommended = [
    ...trending, 
    ...nonTrending
  ].slice(0, 3);

  // Handle case where there are no other tools to recommend
  if (recommended.length === 0) {
    return null; // Don't render the aside if no recommendations exist
  }

  return (
    <aside className="w-full lg:w-80 p-5 bg-white rounded-xl shadow-lg border border-gray-100 h-fit sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3 flex items-center gap-2">
        💡 Recommended Tools
      </h2>

      <div className="flex flex-col gap-3">
        {recommended.map((tool) => (
          <Link
            key={tool.id}
            to={`/tools/${tool.slug}`}
            className="p-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition duration-200 flex items-start gap-3 group"
          >
            {/* Icon */}
            <div className="text-indigo-600 p-2 bg-indigo-100 rounded-md flex-shrink-0">
              <tool.icon size={20} />
            </div>

            {/* Title + Description */}
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700">
                {tool.name}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {tool.description.slice(0, 50)}...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

export default ToolRecommender;