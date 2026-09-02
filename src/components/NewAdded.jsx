import { newTools } from "../data/ToolsData";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function NewAdded() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              New Tools Added
            </h2>
            <p className="text-gray-600">
              Fresh utilities to boost your productivity
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {newTools.map((tool) => (
            <Link to={tool.link}
              key={tool.id}
              className="flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Icon Box */}
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <tool.icon className="w-6 h-6 text-blue-600" />
              </div>

              {/* Text Section */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {tool.name}
                  </h3>

                  {/* NEW Badge */}
                  {tool.isNew && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                      New
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-1">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}

export default NewAdded;
