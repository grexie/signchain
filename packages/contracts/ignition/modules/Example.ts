import { buildModule } from "@nomicfoundation/ignition-core";

const ExampleModule = buildModule('Example', (m) => {
  const Example = m.contract("Example")

  return { Example };
});

export default ExampleModule;