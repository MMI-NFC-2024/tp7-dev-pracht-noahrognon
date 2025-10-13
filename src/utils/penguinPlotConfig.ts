export const tooltipText = (d: any) =>
  `${d.species} (${d.sex ?? "Unknown"}) - ${d.island}
Length: ${d.culmen_length_mm} mm / Depth: ${d.culmen_depth_mm} mm
Flipper: ${d.flipper_length_mm ?? "n/a"} mm / Weight: ${d.body_mass_g ?? "n/a"} g`;

export const basePlotConfig = {
  height: 460,
  marginTop: 32,
  marginRight: 32,
  x: {
    label: "Longueur du culmen (mm)",
  },
  y: {
    label: "Profondeur du culmen (mm)",
  },
  color: {
    legend: true,
    label: "Espece",
  },
  padding: 0.15,
  grid: true,
  ariaLabel:
    "Nuage de points comparant la longueur et la profondeur du culmen des manchots. Chaque point represente un manchot et sa couleur indique l'espece.",
};
