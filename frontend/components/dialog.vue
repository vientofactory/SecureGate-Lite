<template>
  <v-card>
    <v-card-text class="pt-5">
      <slot name="body">
        {{ defaultBodyContent }}
      </slot>
    </v-card-text>
    <v-card-actions>
      <template v-if="cancelable">
        <v-btn color="primary" outlined @click="$emit('hide')">
          {{ footerCancelTitle }}
        </v-btn>
      </template>
      <v-btn v-else color="primary" block outlined @click="$emit('hide')">
        {{ footerHideTitle }}
      </v-btn>
      <template v-if="footerSubmit">
        <v-btn v-if="red" color="red" outlined @click="$emit('submit')">
          {{ footerSubmitTitle }}
        </v-btn>
        <v-btn v-else-if="green" color="success" outlined @click="$emit('submit')">
          {{ footerSubmitTitle }}
        </v-btn>
        <v-btn v-else-if="blue" color="primary" outlined @click="$emit('submit')">
          {{ footerSubmitTitle }}
        </v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "customDialog",
  props: {
    footerSubmit: {
      type: Boolean,
      default: false,
    },
    cancelable: {
      type: Boolean,
      default: false,
    },
    footerSubmitTitle: {
      type: String,
      default: "저장",
    },
    red: {
      type: Boolean,
      default: false,
    },
    green: {
      type: Boolean,
      default: false,
    },
    blue: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    footerHideTitle: "확인",
    footerCancelTitle: "취소",
    defaultBodyContent: "body slot 영역을 작성해주세요.",
  }),
};
</script>
