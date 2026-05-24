import CustomNodeWrapper from "./CustomNodeWrapper";
import { NODE_TEMPLATES } from "./metadata";

// Mapping React Flow node types to the wrapper component
export const nodeTypes = {
  webhookTrigger: CustomNodeWrapper,
  postgresQuery: CustomNodeWrapper,
  apiCall: CustomNodeWrapper,
  jsonTransform: CustomNodeWrapper,
  conditionalRouter: CustomNodeWrapper,
  slackNotify: CustomNodeWrapper,
  httpResponse: CustomNodeWrapper,
  jsRunner: CustomNodeWrapper
};

export { NODE_TEMPLATES };
export default CustomNodeWrapper;
