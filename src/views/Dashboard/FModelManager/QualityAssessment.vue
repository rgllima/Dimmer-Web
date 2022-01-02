<template>
  <div class="quality-assessment">
    <div class="box">
      <div v-if="isLoading">
        <div>Aguarde...</div>
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
        <button
          class="quality-assessment__re-evaluate-button button is-primary"
          @click="evaluate"
        >
          Re-evaluate
        </button>
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
      "isLoading",
    ]),
  },

  methods: {
    ...mapActions("qualityAssessment", ["evaluate"]),
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

  &__re-evaluate-button {
    margin-top: 16px;
  }
}

.mt-8 {
  margin-top: 8px;
}
</style>
