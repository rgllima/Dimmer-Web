<template>
  <div class="quality-assessment">
    <div class="box">
      <div v-if="isLoading">
        <div>Wait...</div>
        <progress
          class="progress is-small is-primary mt-8"
          max="100"
        ></progress>
      </div>
      <div v-else>
        <div class="quality-assessment__status">
          The feature model maintainability is
          <span
            class="quality-assessment__status-tag"
            :class="`quality-assessment__status-tag--${maintainabilityLabel}`"
            >{{ maintainabilityLabel }}</span
          >
        </div>
        <button
          class="quality-assessment__re-evaluate-button button is-primary"
          @click="evaluate"
        >
          Re-evaluate
        </button>
        <div class="quality-assessment__suggestion">
          <div class="quality-assessment__suggestion-title">
            Improvement Suggestion
          </div>
          <div v-if="improvementSuggestionText">
            <div class="quality-assessment__suggestion-text">
              {{ improvementSuggestionText }}
            </div>
            <div class="quality-assessment__suggestion-tip">
              Tip: {{ improvementSuggestionTipText }}
            </div>
          </div>
          <div v-else class="quality-assessment__no-suggestion">
            No suggestions
          </div>
        </div>
        <div class="quality-assessment__refactorings">
          <div class="quality-assessment__refactorings-title">
            Refactoring Suggestions
          </div>
          <div v-if="refactoringSuggestions.length">
            <div
              v-for="(refactoring, index) in refactoringSuggestions"
              :key="index"
              class="quality-assessment__refactoring"
            >
              <div class="quality-assessment__refactoring-title">
                Refactoring {{ refactoring }}
              </div>
              <img :src="getRefactoringImageUrl(refactoring)" alt="" />
            </div>
            <div class="quality-assessment__refactoring">
              <div class="quality-assessment__refactoring-title">Legend</div>
              <img src="../../../assets/refactorings/legend.png" alt="" />
            </div>
          </div>
          <div v-else class="quality-assessment__no-refactorings">
            No refactoring suggestions
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "QualityAssessment",

  computed: {
    ...mapGetters("qualityAssessment", [
      "maintainabilityLabel",
      "improvementSuggestionText",
      "improvementSuggestionTipText",
      "refactoringSuggestions",
      "isLoading",
    ]),
  },

  methods: {
    ...mapActions("qualityAssessment", ["evaluate"]),

    getRefactoringImageUrl(refactoring) {
      var images = require.context(
        "../../../assets/refactorings/",
        false,
        /\.png$/
      );

      return images("./r" + refactoring + ".png");
    },
  },

  mounted() {
    setTimeout(() => {
      this.evaluate();
    }, 1000);
  },
};
</script>

<style lang="scss" scoped>
.quality-assessment {
  &__status {
    font-weight: 600;

    &-tag {
      border-radius: 6px;
      color: #ffffff;
      padding: 3px 6px;

      &--verybad {
        background-color: #ec4741;
      }

      &--bad {
        background-color: #f48847;
      }

      &--moderate {
        background-color: #ffc84a;
      }

      &--good {
        background-color: #a7c34c;
      }

      &--verygood {
        background-color: #4ec04c;
      }
    }
  }

  &__suggestion {
    font-size: 14px;
    margin-top: 16px;

    &-title {
      font-weight: 600;
    }

    &-text,
    &-no-suggestion {
      margin-top: 4px;
    }

    &-tip {
      margin-top: px;
    }
  }

  &__refactorings {
    font-size: 14px;
    margin-top: 16px;

    &-title {
      font-weight: 600;
    }

    &-no-refactorings {
      margin-top: 4px;
    }
  }

  &__refactoring {
    margin-top: 16px;

    &-title {
      font-size: 12px;
      font-weight: 600;
    }

    img {
      margin-left: -10px;
    }
  }

  &__re-evaluate-button {
    margin-top: 16px;
  }
}

.mt-8 {
  margin-top: 8px;
}
</style>
