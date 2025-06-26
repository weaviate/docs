import React, { useEffect } from "react";

const DockerConfigGen = () => {
  useEffect(() => {
    const configDiv = document.getElementById("configuration-generator-root");
    if (configDiv) {
      const scriptA = document.createElement("script");
      scriptA.src = "/js/configgen/2.709632dd.chunk.js";
      scriptA.type = "text/javascript";
      configDiv.appendChild(scriptA);

      const scriptB = document.createElement("script");
      scriptB.src = "/js/configgen/main.dde0b96f.chunk.js";
      scriptB.type = "text/javascript";
      configDiv.appendChild(scriptB);

      const scriptC = document.createElement("script");
      scriptC.src = "/js/configgen/runtime-main.a0f4ef68.js";
      scriptC.type = "text/javascript";
      configDiv.appendChild(scriptC);
    }
  }, []);

  return (
    <div>
      <div id="configuration-generator-root"></div>
    </div>
  );
};

export default DockerConfigGen;
