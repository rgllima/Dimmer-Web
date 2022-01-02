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
        ">": "Increase the number of features (hint: divide very broad features into smaller features)",
        "<=": "Decrease the number of features (hint: add very small features into larger features)",
      },
      NM: {
        ">": "Increase the number of mandatory features (hint: check if there are any optional features that should be mandatory)",
        "<=": "Decrease the number of mandatory features (hint: check if there are any mandatory features that should be optional)",
      },
      NTop: {
        ">": "Restructure the feature model so that the number of features that descend directly from the root of the tree increases",
        "<=": "Restructure the feature model so that the number of features that descend directly from the root of the tree decreases",
      },
      NLeaf: {
        ">": "Restructure the feature model so that the number of features in the last level of the tree increases",
        "<=": "Restructure the feature model so that the number of features in the last level of the tree decreases",
      },
      DTMax: {
        ">": "Restructure the feature model so that the number of levels in the tree increases",
        "<=": "Restructure the feature model so that the number of levels in the tree decreases",
      },
      CogC: {
        ">": "Increase the number of Or or XOr type groupings",
        "<=": "Decrease the number of Or or XOr type groupings",
      },
      FoC: {
        ">": "Increase the number of optional features (hint: check if there are any mandatory features that should be optional) or decrease the number of features (hint: add very small features into larger features)",
        "<=": "Decrease the number of optional features (hint: check if there are any optional features that should be mandatory) or increase the number of features (hint: divide very comprehensive features into smaller features)",
      },
      SCDF: {
        ">": "Restructure the feature model so that the number of features that are children of XOr type groupings increases",
        "<=": "Restructure the feature model so that the number of features that are children of groupings of type XOr decreases",
      },
      RDen: {
        ">": "Increase the number of features referenced in constraints",
        "<=": "Decrease the number of features referenced in constraints",
      },
    };

    return tips[feature][comparator];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
