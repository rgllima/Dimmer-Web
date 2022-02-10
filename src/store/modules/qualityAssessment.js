import instance from "@/store/modules/axios.config";
import {
  predictByDecisionTree,
  getImprovementSuggestions,
} from "../../util/quality-assessment";
import decisionTree from "../../util/decision-tree.json";

async function getMeasuresUsedToPredictMaintainability(allMeasures) {
  const measuresUsedToPredictMaintainability = allMeasures.filter((m) =>
    [
      "NF",
      "NM",
      "NTop",
      "NLeaf",
      "DT MAX",
      "CogC",
      "FoC",
      "SCDF",
      "FRCM",
    ].includes(m.initials)
  );

  return measuresUsedToPredictMaintainability;
}

async function calculateMeasures(measures, featureModel) {
  const response = await instance.post("/qualitymeasures/apply", {
    measures,
    featureModel,
  });
  const calculatedMeasures = response.data.appliedQualityMeasuresList.reduce(
    (acc, item) => {
      if (item.initials === "DT MAX") {
        acc["DTMax"] = item.value;
      } else if (item.initials === "FRCM") {
        acc["RDen"] = item.value;
      } else {
        acc[item.initials] = item.value;
      }

      return acc;
    },
    {}
  );

  return calculatedMeasures;
}

function getMeasureLongName(measure) {
  const names = {
    NF: "NF (number of features)",
    NM: "NM (number of mandatory features)",
    NTop: "NTop (number of top features)",
    NLeaf: "NLeaf (number of leaf features)",
    DTMax: "DT MAX (depth of tree max)",
    CogC: "CogC (cognitive complexity)",
    FoC: "FoC (flexibility of configuration)",
    SCDF: "SCDF (single cyclic dependent features)",
    RDen: "FRCM (features referenced in constraints mean)",
  };

  return names[measure];
}

const state = {
  maintainabilityPrediction: null,
  improvementSuggestion: null,
  isLoading: false,
  error: null,
};

const mutations = {
  setMaintainabilityPrediction: (state, payload) => {
    state.maintainabilityPrediction = payload;
  },
  setImprovementSuggestion: (state, payload) => {
    state.improvementSuggestion = payload;
  },
  setIsLoading(state, payload) {
    state.isLoading = payload;
  },
  setError(state, payload) {
    state.error = payload;
  },
};

const actions = {
  async evaluate({ commit, rootGetters }) {
    try {
      commit("setIsLoading", true);

      const allMeasures = rootGetters["qualityMeasures/getMeasures"];
      const measures = await getMeasuresUsedToPredictMaintainability(
        allMeasures
      );
      const featureModel = rootGetters["featureModel/getFeatureModel"];
      const calculatedMeasures = await calculateMeasures(
        measures,
        featureModel
      );
      const maintainabilityPrediction = predictByDecisionTree(
        calculatedMeasures,
        decisionTree
      );
      const [improvementSuggestion] = getImprovementSuggestions(
        calculatedMeasures,
        maintainabilityPrediction
      );

      commit("setMaintainabilityPrediction", maintainabilityPrediction);
      commit("setImprovementSuggestion", improvementSuggestion);
    } catch (error) {
      commit("setError", error);
    } finally {
      commit("setIsLoading", false);
    }
  },
};

const getters = {
  isLoading: (state) => state.isLoading,
  maintainabilityLabel: (state) => state.maintainabilityPrediction?.label,
  improvementSuggestionText: (state) => {
    const { improvementSuggestion } = state;

    if (!improvementSuggestion) return "";

    const { feature, comparator, threshold } = improvementSuggestion;
    const measureLongName = getMeasureLongName(feature);

    return `Make ${measureLongName} ${comparator} ${threshold}`;
  },
  improvementSuggestionTipText: (state) => {
    const { improvementSuggestion } = state;

    if (!improvementSuggestion) return "";

    const { feature, comparator } = improvementSuggestion;
    const tips = {
      NF: {
        ">": "Increase the number of features",
        "<=": "Decrease the number of features",
      },
      NM: {
        ">": "Increase the number of mandatory features",
        "<=": "Decrease the number of mandatory features",
      },
      NTop: {
        ">": "Increase the number of features that descend directly from the root of the tree",
        "<=": "Decrease the number of features that descend directly from the root of the tree",
      },
      NLeaf: {
        ">": "Increase the number of features in the last level of the tree",
        "<=": "Decrease the number of features in the last level of the tree",
      },
      DTMax: {
        ">": "Increase the number of levels in the tree",
        "<=": "Decrease the number of levels in the tree",
      },
      CogC: {
        ">": "Increase the number of Or or XOr type groupings",
        "<=": "Decrease the number of Or or XOr type groupings",
      },
      FoC: {
        ">": "Increase the number of optional features or decrease the number of features",
        "<=": "Decrease the number of optional features or increase the number of features",
      },
      SCDF: {
        ">": "Increase the number of features that are children of XOr type groupings",
        "<=": "Decrease the number of features that are children of groupings of type XOr",
      },
      RDen: {
        ">": "Increase the number of features referenced in constraints",
        "<=": "Decrease the number of features referenced in constraints",
      },
    };

    return tips[feature][comparator];
  },
  refactoringSuggestions: (state) => {
    const { improvementSuggestion } = state;

    if (!improvementSuggestion) return [];

    const { feature, comparator } = improvementSuggestion;
    const refactorings = {
      NF: {
        ">": [1, 2],
        "<=": [3, 4, 5],
      },
      NM: {
        ">": [5, 6, 7, 8, 9, 10],
        "<=": [11, 12, 13],
      },
      NTop: {
        ">": [14, 15, 16, 17, 18, 19],
        "<=": [20, 21, 22, 23, 24, 25],
      },
      NLeaf: {
        ">": [1, 2, 32, 33, 34],
        "<=": [26, 27, 28, 29, 30, 31],
      },
      DTMax: {
        ">": [35, 36, 37, 38, 39, 40],
        "<=": [41, 42, 43, 44, 45, 46],
      },
      CogC: {
        ">": [47, 48],
        "<=": [5, 49, 50, 51],
      },
      FoC: {
        ">": [3, 4, 5, 11, 13, 49, 50, 51, 52],
        "<=": [1, 6, 8, 9, 10, 47, 53, 54],
      },
      SCDF: {
        ">": [1, 55],
        "<=": [4, 5, 52, 54, 56, 57],
      },
      RDen: {
        ">": [11, 14, 49, 56, 58],
        "<=": [3, 4, 8, 10, 20, 47, 55, 60],
      },
    };

    return refactorings[feature][comparator];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
