<template>
  <div class="home-wrapper">
    <div class="config-wrap">
      <div class="config-wrap-scroll">
        <HTrain
          ref="trainComponent"
          :yaml_template_sn="train_yaml_template_sn"
          @onMessage="handlerErrorMessage"
        >
          <template v-slot:changeModel>
            <div class="config-row change-item yaml-item">
              <HConfigSelect
                class="select"
                tooltip="yaml_template"
                label="yaml_template :"
                :filterable="true"
                :loading="yaml_template_loading"
                :options="trainStore.train_server_yaml_file_options"
                v-model="snStore.train_sn"
              >
                <template>
                  <el-button
                    class="rest-btn"
                    type="primary"
                    size="mini"
                    @click="handleRefreshYamlTemplate"
                    style="margin-left: 10px"
                  >
                    reset
                  </el-button>
                </template>
              </HConfigSelect>
            </div>
          </template>
        </HTrain>
      </div>
    </div>
  </div>
</template>
<script>
import HTrain from './train/index.vue';
import useSnStore from '@/store/snStore';
import useTrainStore from '@/store/trainStore';
import copy from 'copy-to-clipboard';
import { STATUS_TYPE } from '@/constants/index';

export default {
  name: 'IndexH',
  components: {
    HTrain
  },
  data() {
    return {
      pretrained_model: '',
      loading: false,
      yaml_template_loading: false,
      generate_yaml_template_sn: '',
      train_yaml_template_sn: ''
    };
  },
  setup() {
    const snStore = useSnStore();
    const trainStore = useTrainStore();
    return { snStore, trainStore };
  },
  created() {
    this.generate_yaml_template_sn = this.snStore.generateSn;
    this.train_yaml_template_sn = this.snStore.trainSn;
    this.activeName = this.$route.query.activeName || 'generate';
  },
  methods: {
    copyText(txt) {
      copy(txt);
      this.$message.success(`复制成功：${txt}`);
    },
    handleNavClick(nav) {
      this.activeName = nav.value;
      if (nav.value === this.$route.query.activeName) return;
      // 设置url query参数
      this.$router.push({
        query: {
          activeName: nav.value
        }
      });
    },

    handleRefresh() {
      this.loading = true;
      this.commonStore.pretrained_model_refresh().finally(() => {
        setTimeout(() => {
          this.loading = false;
        }, 500);
      });
    },
    handleRefreshYamlTemplate() {
      this.snStore.setTrainSn(this.snStore.trainSn);
      this.$refs.trainComponent.initDefaultData();
    },

    handlerErrorMessage(status) {
      const { UNACTIVE_INTERRUPT, DELETE_OR_NOT_EXIST } = STATUS_TYPE;
      switch (status) {
        case UNACTIVE_INTERRUPT:
          this.$message.error('执行失败');
          break;
        case DELETE_OR_NOT_EXIST:
          this.$message.error('任务不存在或被删除');
          break;
      }
    }
  }
};
</script>
<style lang="scss">
.home-wrapper {
  height: 100%;
  width: 100%;
  overflow: hidden;
  @include flexLayout(row, 0);
  .nav-wrap {
    width: 240px;
    min-width: 240px;
    background-color: #eff2f7;
    @include block-shadow();
    @include flexLayout(column, 6px);
    justify-content: center;
    position: relative;
    .nav-item {
      height: 50px;
      line-height: 50px;
      padding-left: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #666;
      overflow: hidden;
      &-label {
        font-size: 18px;
      }
      &-icon {
        font-size: 24px;
        margin-right: 10px;
      }
      .nav-item-wrap {
        position: relative;
        transition: all 0.2s ease-in-out;
      }
      &:hover {
        background-color: #e4e7ed;
        .nav-item-wrap {
          transform: translateX(14px);
        }
      }
      &.is-active {
        color: #070707;
        .nav-item-wrap {
          transform: translateX(14px);
        }
      }
    }
    .change-item {
      position: absolute;
      top: 10px;
      left: 10px;
    }
  }
  .config-wrap {
    flex: 1;
    min-width: 1000px;
    height: 100%;
    overflow-y: scroll;
    &-scroll {
      min-width: 1250px;
      width: auto;
      height: 100%;
      .generate-block {
        .btn-and-config {
          gap: 0;
        }
        .change-item {
          margin-top: 0;
          margin-right: 10px;
          .rest-btn {
            margin-left: 10px;
          }
          &.yaml-item {
            margin: 0px 0 10px;
          }
        }
      }
    }
  }
}
</style>
