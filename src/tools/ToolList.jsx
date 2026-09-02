import { useState } from "react";
import { Search } from "lucide-react";
import { toolsCount, tools } from "../data/ToolsData";
import { Link } from "react-router-dom";

function ToolList() {
  const [search, setSearch] = useState("");

  // Search filter logic
  const filteredTools = tools.filter((tool) => {
    const query = search.toLowerCase();

    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      tool.slug.toLowerCase().includes(query) ||
      tool.id.toLowerCase().includes(query) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <section className="bg-gray-50 min-h-screen pt-[140px] pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Tools Count */}
        <div className="flex justify-center">
          <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-medium shadow-sm">
            <span>📦</span> {filteredTools.length} Tools Available
          </span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900">All Tools</h3>
          <p className="text-gray-500">
            Browse our complete collection of utilities designed to make your life easier.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-white border border-gray-300 px-4 py-3 rounded-2xl shadow-sm w-full max-w-xl">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-gray-700 focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <Link
              to={tool.link}
              key={tool.id}
              className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-blue-400 transition"
            >
              {/* Icon */}
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                <tool.icon size={28} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {tool.name}
                  </h4>

                  {/* Badges */}
                  {tool.isNew && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-[2px] rounded-md">
                      New
                    </span>
                  )}

                  {tool.isTrending && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-[2px] rounded-md">
                      Trending
                    </span>
                  )}
                </div>

                <p className="text-gray-500 text-sm">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default ToolList;
