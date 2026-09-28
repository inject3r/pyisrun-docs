export type ProjectType = {
  name: string;
  tagline: string;
  version: string;
  versions: string[];
  repo: string;
  pypi: string;
};

export const Project: ProjectType = {
  name: "PylsRun",
  tagline: "Native performance primitives for Python",
  version: "0.1.0",
  versions: ["0.1.0"],
  repo: "https://github.com/pylsrun/pylsrun",
  pypi: "pylsrun",
};
