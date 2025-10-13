import * as Plot from "@observablehq/plot";
import departements from "../assets/departements.geojson.json";
import populationMain from "../assets/populationMain.json";

type PopulationEntry = {
  "Géographie": string;
  "Période": number;
  "Sexe": string;
  "Âge": string;
  "Valeur": number;
};

type Filters = {
  year: number;
  sex: string;
  age: string;
};

const valueKey = (dept: string, year: number, sex: string, age: string) =>
  `${dept}|${year}|${sex}|${age}`;

const valueLookup = new Map<string, number>(
  (populationMain as PopulationEntry[]).map((entry) => [
    valueKey(entry["Géographie"], entry["Période"], entry["Sexe"], entry["Âge"]),
    entry["Valeur"] ?? 0,
  ]),
);

const numberFormatter = new Intl.NumberFormat("fr-FR");

const getValue = (dept: string, filters: Filters) =>
  valueLookup.get(valueKey(dept, filters.year, filters.sex, filters.age)) ?? null;

const baseConfig = {
  projection: {
    type: "mercator",
    domain: departements,
  },
  color: {
    type: "quantile",
    n: 7,
    scheme: "Blues",
    label: "Population (habitants)",
    legend: true,
    reverse: false,
  },
  height: 560,
  marginTop: 40,
  marginBottom: 40,
  ariaLabel:
    "Carte choroplèthe des départements français indiquant la population pour l'année, le sexe et la tranche d'âge sélectionnés.",
};

const createPlot = (filters: Filters) =>
  Plot.plot({
    ...baseConfig,
    marks: [
      Plot.geo(departements, {
        fill: (d: any) => getValue(d.properties.nom, filters) ?? 0,
        stroke: "#1f2937",
        strokeWidth: 0.6,
        title: (d: any) => {
          const deptName = d.properties.nom;
          const value = getValue(deptName, filters);
          if (value == null) {
            return `${deptName} — données non disponibles (${filters.age}, ${filters.sex}, ${filters.year})`;
          }
          return `${deptName} — ${numberFormatter.format(value)} habitant·e·s (${filters.age}, ${filters.sex}, ${filters.year})`;
        },
        tip: true,
      }),
      Plot.graticule({ stroke: "#cbd5f5", strokeOpacity: 0.35 }),
    ],
  });

const formatSummary = (filters: Filters) => {
  const total = (populationMain as PopulationEntry[])
    .filter(
      (entry) =>
        entry["Période"] === filters.year &&
        entry["Sexe"] === filters.sex &&
        entry["Âge"] === filters.age,
    )
    .reduce((acc, entry) => acc + (entry["Valeur"] ?? 0), 0);

  const noun = total > 1 ? "habitants" : "habitant";
  return `${numberFormatter.format(total)} ${noun} (${filters.sex}, tranche ${filters.age}) en ${filters.year}.`;
};

const run = () => {
  const selectors = {
    year: document.getElementById("filter-year") as HTMLSelectElement | null,
    sex: document.getElementById("filter-sex") as HTMLSelectElement | null,
    age: document.getElementById("filter-age") as HTMLSelectElement | null,
  };

  const resetButton = document.getElementById("filters-reset") as HTMLButtonElement | null;
  const summary = document.getElementById("population-summary");
  const plotRoot = document.getElementById("population-choropleth");

  if (!plotRoot || !selectors.year || !selectors.sex || !selectors.age || !summary) {
    return;
  }

  let currentPlot: ReturnType<typeof createPlot> | null = null;

  const refreshPlot = () => {
    const filters: Filters = {
      year: Number(selectors.year!.value),
      sex: selectors.sex!.value,
      age: selectors.age!.value,
    };

    if (currentPlot) {
      currentPlot.remove();
      currentPlot = null;
    }

    currentPlot = createPlot(filters);
    plotRoot.replaceChildren(currentPlot);
    summary.textContent = formatSummary(filters);
  };

  Object.values(selectors).forEach((select) => {
    select?.addEventListener("change", refreshPlot);
  });

  resetButton?.addEventListener("click", () => {
    Object.values(selectors).forEach((select) => {
      if (!select) return;
      const defaultOption = select.querySelector("option[selected]");
      if (defaultOption) {
        select.value = (defaultOption as HTMLOptionElement).value;
      } else {
        select.selectedIndex = 0;
      }
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
