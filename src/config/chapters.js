import { bg } from "./localeBg.js";
export const SOURCES = {
  plastic: {
    label: bg.sourceLabels.unep,
    url: "https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-marine-litter",
  },
  net: {
    label: bg.sourceLabels.fao,
    url: "https://www.fao.org/responsible-fishing/marking-of-fishing-gear/abandoned--lost-or-otherwise-discarded-fishing-gear-%28aldfg%29/en",
  },
  noaa: {
    label: bg.sourceLabels.noaa,
    url: "https://www.noaa.gov/gc-international-section/marine-debris-derelict-fishing-gear",
  },
  waste: {
    label: bg.sourceLabels.unep,
    url: "https://www.unep.org/en/publications/report/global-waste-management-outlook-2024",
  },
};
export const CHAPTERS = bg.chapterData.map((chapter, i) => ({
  ...chapter,
  id: i + 1,
  roman: ["I", "II", "III"][i],
  illustration: `./assets/art/chapter-${i + 1}.svg`,
  sources: [[SOURCES.plastic], [SOURCES.net, SOURCES.noaa], [SOURCES.waste]][i],
}));
