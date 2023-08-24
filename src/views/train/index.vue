<template>
  <div class="train-wrapper">
    <div class="train-left">
      <HBlock class="outerWrapperShadow">
        <slot name="changeModel"></slot>
      </HBlock>
      <HBlock class="outerWrapperShadow">
        <div class="btns">
          <el-button class="primary-btn" type="primary" @click="openSaveModal">Save</el-button>
        </div>
        <!-- <div class="config-row">
          <el-radio-group v-model="train_mode">
            <el-radio :label="1">with accelerate and only one gpu</el-radio>
            <el-radio :label="0">with accelerate</el-radio>
            <el-radio :label="2">with colossal-AI</el-radio>
          </el-radio-group>
        </div> -->
      </HBlock>
      <HBlock class="outerWrapperShadow">
        <div class="config-row">
          <HConfigInput
            label="exp_dir"
            tooltip="train.exp_dir"
            style="font-size: 13px"
            disabled
            v-model="config.exp_dir"
          />
        </div>
        <div class="config-row">
          <HConfigSelect
            label="mixed_precision"
            style="font-size: 13px"
            :options="dtype_options"
            tooltip="train.mixed_precision"
            v-model="config.mixed_precision"
          />
        </div>
        <div class="config-row">
          <HConfigInputNumber
            tooltip="train.seed"
            label="seed"
            style="font-size: 13px"
            :min="1"
            v-model="config.seed"
          />
        </div>
        <div class="config-row">
          <HConfigSelect
            label="ckpt_type"
            tooltip="train.ckpt_type"
            style="font-size: 13px"
            :options="ckpt_type_options"
            v-model="config.ckpt_type"
          />
        </div>
        <div class="config-row">
          <el-checkbox v-model="config.allow_tf32">allow_tf32</el-checkbox>
        </div>
      </HBlock>
    </div>

    <div class="train-right">
      <el-tabs v-model="tabName" class="outerWrapperShadow" ref="tabRef">
        <!-- model -->
        <el-tab-pane label="model" name="model">
          <ModelConfig />
        </el-tab-pane>
        <!-- tokenizer_pt -->
        <el-tab-pane label="tokenizer_pt" name="tokenizer_pt">
          <TokenizerPtConfig :tokenizer_pt_train_name_options="tokenizer_pt_train_name_options" />
        </el-tab-pane>
        <!-- train -->
        <el-tab-pane label="train" name="train">
          <TrainConfig />
        </el-tab-pane>
        <!-- unet -->
        <el-tab-pane label="unet" name="unet">
          <UnetConfig v-model="isOpenUnetCollapse" />
        </el-tab-pane>
        <!-- text_encoder -->
        <el-tab-pane label="text_encoder" name="text_encoder">
          <TextEncoderConfig v-model="isOpenTextEncoderCollapse" />
        </el-tab-pane>
        <!-- lora_unet -->
        <el-tab-pane label="lora_unet" name="lora_unet">
          <LoraUnetConfig v-model="isOpenLoraUnetCollapse" />
        </el-tab-pane>
        <!-- lora_text_encoder -->
        <el-tab-pane label="lora_text_encoder" name="lora_text_encoder">
          <LoraTextEncoderConfig v-model="isOpenLoraTextEncoderCollapse" />
        </el-tab-pane>
        <!-- plugin_unet -->
        <el-tab-pane label="plugin_unet" name="plugin_unet">
          <PluginUnetConfig v-model="isOpenPluginUnetCollapse" />
        </el-tab-pane>
        <!-- plugin_TE -->
        <el-tab-pane label="plugin_TE" name="plugin_TE">
          <PluginTEConfig v-model="isOpenPluginTeCollapse" />
        </el-tab-pane>
        <!-- data -->
        <el-tab-pane label="data" name="data">
          <DataConfig ref="dataComponent" :tab-height="tabHeight" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <CfgSaveModal ref="saveModal" @save="saveTrainingYamlFile"></CfgSaveModal>
  </div>
</template>
<script>
import ModelConfig from './components/modelConfig.vue';
import TokenizerPtConfig from './components/tokenizerPtConfig.vue';
import TextEncoderConfig from './components/textEncoderConfig.vue';
import UnetConfig from './components/unetConfig.vue';
import LoraUnetConfig from './components/loraUnetConfig.vue';
import LoraTextEncoderConfig from './components/loraTextEncoderConfig.vue';
import PluginUnetConfig from './components/pluginUnetConfig.vue';
import PluginTEConfig from './components/pluginTEConfig.vue';
import DataConfig from './components/dataConfig.vue';
import TrainConfig from './components/trainConfig.vue';
import CfgSaveModal from './components/cfgSaveModal.vue';
import { default_train_data, ckpt_type_options, dtype_options } from '@/constants/index';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { merge, isNil, isEmpty, cloneDeep } from 'lodash-es';
import useCommonStore from '@/store/commonStore';
import useSnStore from '@/store/snStore';
import useTrainStore from '@/store/trainStore';
import * as yaml from 'js-yaml';
import deepmerge from 'deepmerge';

export default {
  name: 'HTrain',
  components: {
    ModelConfig,
    TokenizerPtConfig,
    TextEncoderConfig,
    UnetConfig,
    LoraUnetConfig,
    LoraTextEncoderConfig,
    PluginUnetConfig,
    PluginTEConfig,
    DataConfig,
    TrainConfig,
    CfgSaveModal
  },
  props: {
    yaml_template_sn: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabName: 'model',
      imgs: [],
      ckpt_type_options,
      tokenizer_pt_train_name_options: [],
      dtype_options,
      params: cloneDeep(default_train_data),
      timer: null,
      // 训练类型
      train_mode: 1,
      colors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ],
      isOpenUnetCollapse: false,
      isOpenTextEncoderCollapse: false,
      isOpenPluginUnetCollapse: false,
      isOpenPluginTeCollapse: false,
      isOpenLoraUnetCollapse: false,
      isOpenDataCollapse: false,
      isOpenLoraTextEncoderCollapse: false,
      tabHeight: 1000,
      scrollPosition: 0,
      isOpenImgTransforms: false
    };
  },
  setup() {
    const commonStore = useCommonStore();
    const snStore = useSnStore();
    const trainStore = useTrainStore();
    const { train } = storeToRefs(trainStore);
    // 任意更新储存到localstorage
    watch(train, (state) => trainStore.storageTrain(state), { deep: true });
    return { commonStore, snStore, trainStore, config: train };
  },
  mounted() {
    this.initDefaultData();
    if (this.$refs.tabRef) {
      this.tabHeight = this.$refs.tabRef.$el.offsetHeight - 174;
    }
  },
  methods: {
    dataSourceName(dataset) {
      const length = this.dataSourceList(dataset).length;
      return `data_source${length + 1}`;
    },
    async initDefaultData() {
      this.trainStore.tokenizer_pt_train_name = [];
      let info = await this.loadConfigFromAssets('cfgs/train/' + this.snStore.trainSn + '.yaml');
      info = this.parseOmegaGammer(info);
      const newInfo = merge(cloneDeep(default_train_data), info);
      // 保留模型
      newInfo.pretrained_model = this.config.pretrained_model;
      if (!isEmpty(info)) {
        this.$refs.dataComponent.initDefaultData(newInfo);
      }
      //console.log('info', newInfo);
      this.initDefaultView(newInfo);
    },
    async loadConfigFromAssets(path) {
      const file = await this.loadFile(path);
      const current_config = yaml.load(file);
      const parents = [];
      if (Object.prototype.hasOwnProperty.call(current_config, '_base_')) {
        for (const baseConfig of current_config._base_) {
          const parent = await this.loadConfigFromAssets(baseConfig);
          parents.push(parent);
        }
      }
      if (parents.length === 0) {
        return current_config;
      } else {
        const merged_config = this.deepMergeConfigs(...parents, current_config);
        delete merged_config._base_;
        return merged_config;
      }
    },
    deepMergeConfigs(...args) {
      let result = {};
      //eslint-disable-next-line
      const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
      for (const obj of args) {
        result = deepmerge(result, obj, { arrayMerge: overwriteMerge });
      }
      return result;
    },
    parseOmegaGammer(config, parent) {
      let obj = cloneDeep(config);
      if (parent) {
        obj._pConfig = parent;
      }
      for (const key in obj) {
        if (key === '_pConfig') continue;
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (!obj[key]) continue;
        if (typeof obj[key] === 'object') {
          obj[key] = this.parseOmegaGammer(obj[key], obj);
        } else {
          obj = this.parseOmegaGammerNodeInterpolation(obj, key);
        }
      }
      if (obj._pConfig) {
        delete obj._pConfig;
      }
      return obj;
    },
    parseOmegaGammerNodeInterpolation(obj, key) {
      const target = obj[key];
      if (typeof target === 'string') {
        const reg = /(?<=\${\.)(.+?)(?=\})/g;
        const match = target.match(reg);
        if (match) {
          let parent = obj;
          let replaceKey = match[0];
          if (key === replaceKey) return;
          while (replaceKey[0] === '.') {
            parent = parent._pConfig;
            replaceKey = replaceKey.substring(1);
          }
          obj[key] = cloneDeep(parent[replaceKey]);
        }
      }
      return obj;
    },
    async loadFile(path) {
      const xhr = new XMLHttpRequest();
      const okStatus = document.location.protocol === 'file:' ? 0 : 200;
      xhr.open('GET', path, false);
      xhr.overrideMimeType('text/html;charset=utf-8');
      xhr.send(null);
      return xhr.status === okStatus ? xhr.responseText : null;
    },
    initDefaultView(info) {
      const { unet, text_encoder, plugin_unet, plugin_TE, lora_unet, data, lora_text_encoder } =
        info;
      // 控制开关
      this.isOpenUnetCollapse = !isNil(unet) && !isEmpty(unet);
      this.isOpenTextEncoderCollapse = !isNil(text_encoder) && !isEmpty(text_encoder);
      this.isOpenPluginUnetCollapse = !isNil(plugin_unet) && !isEmpty(plugin_unet);
      this.isOpenPluginTeCollapse = !isNil(plugin_TE) && !isEmpty(plugin_TE);
      this.isOpenLoraUnetCollapse = !isNil(lora_unet) && !isEmpty(lora_unet);
      this.isOpenDataCollapse = !isNil(data) && !isEmpty(data);
      this.isOpenLoraTextEncoderCollapse = !isNil(lora_text_encoder) && !isEmpty(lora_text_encoder);
      // 先打开折叠再更新数据，否则将不会渲染页面。
      this.$nextTick(() => {
        // 触发全局相应
        this.config = { ...info };
      });
    },
    openSaveModal() {
      this.$refs.saveModal.open();
    },
    saveTrainingYamlFile(fileName) {
      const finishConfig = yaml.dump(this.config);
      const blob = new Blob([finishConfig], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  }
};
</script>

<style lang="scss" scoped>
::v-deep .el-tabs .el-tabs__header .el-tabs__item {
  padding: 0 10px !important;
}

.train-wrapper {
  width: 100%;
  height: 100%;
  @include flexLayout(row, 0);
  .train-left {
    flex: 1.5;
    padding: 20px;
    box-sizing: border-box;
    .outerWrapperShadow + .outerWrapperShadow {
      margin-top: 20px;
    }
    .el-radio + .el-radio {
      margin-top: 14px;
    }
    .interrupt-btn {
      width: 100%;
      height: 100%;
      border: 1px solid #b9c0cb !important;
      color: #3b414f !important;
      background: #b9c0cb !important;
    }
    .el-progress {
      width: 100%;
    }
  }
  .train-right {
    height: 100%;
    flex: 5;
    padding: 20px;
    box-sizing: border-box;
    .el-tabs {
      height: 100%;
      border-radius: 10px;
      @include flexLayout(column, 0);
      .el-tabs__nav {
        display: flex;
        flex-wrap: wrap;
      }
      ::v-deep .el-tabs__content {
        flex: 1;
        overflow-y: scroll;
        height: 100%;
        .el-tab-pane {
          min-height: 100%;
        }
        .el-collapse-item__wrap {
          border-radius: 0 0 10px 10px;
          overflow: inherit !important;
        }
      }
    }
  }
}
.outerWrapperShadow-other {
  @include flexLayout(column, 0, center, center);
}
</style>
