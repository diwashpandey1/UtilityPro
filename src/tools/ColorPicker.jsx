import ToolHeader from "./ToolHeader";
import ToolRecommender from "./ToolRecommender";
import { tools } from "../data/ToolsData";
import ClrPkr from "./toolsecs/ClrPkr";

function ColorPicker() {

  // get tool data for this page
  const tool = tools.find((t) => t.componentName === "ColorPicker");
  const currentToolSlug = tool ? tool.slug : "";

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-2 md:p-5">

      {/* Left side */}
      <div className="lg:col-span-2 space-y-6">

        {/* TOOL HEADER (Top Card UI) */}
        <ToolHeader tool={tool} />

        {/* TOOL WORKSPACE CARD */}
        <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border">
          <ClrPkr />
        </div>

      </div>

      {/* Right Sidebar */}
      <ToolRecommender currentToolSlug={currentToolSlug} />
    </div>
  );
}

export default ColorPicker;
