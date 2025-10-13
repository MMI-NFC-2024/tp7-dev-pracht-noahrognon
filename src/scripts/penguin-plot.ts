import * as Plot from "@observablehq/plot";
import penguinsData from "../assets/penguins.json";
import { basePlotConfig, tooltipText } from "../utils/penguinPlotConfig";

type Filters = {
  species: string;
  island: string;
  sex: string;
};

const formatSummary = (data: typeof penguinsData, filters: Filters) => {
  const count = data.length;
  const noun = count > 1 ? "observations" : "observation";
  const suffix = count > 1 ? "s" : "";

  const details: string[] = [];
  if (filters.species !== "all") details.push(`espece ${filters.species}`);
  if (filters.island !== "all") details.push(`ile ${filters.island}`);
  if (filters.sex !== "all") details.push(`sexe ${filters.sex}`);

  const detailText = details.length
    ? ` pour ${details.join(", ")}`
    : " pour l'ensemble du jeu de donnees";

  return `${count} ${noun}${suffix} affichee${suffix}${detailText}.`;
};

const createPlot = (data: typeof penguinsData) =>
  Plot.plot({
    ...basePlotConfig,
    marks: [
      Plot.ruleY([0]),
      Plot.dot(data, {
        x: "culmen_length_mm",
        y: "culmen_depth_mm",
        stroke: "species",
        title: tooltipText,
        tip: true,
      }),
    ],
  });

const run = () => {
  const selectors = {
    species: document.getElementById("filter-species") as HTMLSelectElement | null,
    island: document.getElementById("filter-island") as HTMLSelectElement | null,
    sex: document.getElementById("filter-sex") as HTMLSelectElement | null,
  };

  const resetButton = document.getElementById("filter-reset") as HTMLButtonElement | null;
  const summary = document.getElementById("filter-summary");
  const plotRoot = document.getElementById("penguin-scatter");

  if (!plotRoot || !selectors.species || !selectors.island || !selectors.sex || !summary) {
    return;
  }

  let currentPlot: ReturnType<typeof createPlot> | null = null;

  const refreshPlot = () => {
    const filters: Filters = {
      species: selectors.species!.value,
      island: selectors.island!.value,
      sex: selectors.sex!.value,
    };

    const filtered = penguinsData.filter((d) => {
      if (filters.species !== "all" && d.species !== filters.species) return false;
      if (filters.island !== "all" && d.island !== filters.island) return false;
      if (filters.sex !== "all" && d.sex !== filters.sex) return false;
      return true;
    });

    if (currentPlot) {
      currentPlot.remove();
      currentPlot = null;
    }

    if (filtered.length === 0) {
      plotRoot.textContent = "Aucune observation ne correspond aux filtres selectionnes.";
      summary.textContent = "0 observation affichee pour cette combinaison de filtres.";
      return;
    }

    currentPlot = createPlot(filtered);
    plotRoot.replaceChildren(currentPlot);
    summary.textContent = formatSummary(filtered, filters);
  };

  Object.values(selectors).forEach((select) => {
    select?.addEventListener("change", refreshPlot);
  });

  resetButton?.addEventListener("click", () => {
    Object.values(selectors).forEach((select) => {
      if (select) select.value = "all";
    });
    refreshPlot();
  });

  refreshPlot();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run, { once: true });
} else {
  run();
}
