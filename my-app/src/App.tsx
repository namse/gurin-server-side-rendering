import React, { useState } from "react";

export function App() {
  const [state, setState] = useState(5);
  return (
    <>
      <div>Hello World! {state}</div>
      <button onClick={() => setState((x) => x + 1)}>Click me</button>
    </>
  );
}
