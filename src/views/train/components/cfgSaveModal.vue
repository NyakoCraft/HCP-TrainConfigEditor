<template>
  <el-dialog title="配置名" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
    <div class="save-filename-field">
      <el-form ref="form" label-width="80px">
        <el-form-item label="配置文件名">
          <el-input v-model="fileName" placeholder="请输入文件名">
            <template slot="append">{{ suffix }}</template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSave">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      dialogVisible: false,
      fileName: 'train',
      suffix: '.yaml'
    };
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    open() {
      this.dialogVisible = true;
    },
    handleSave() {
      this.$emit('save', this.fileName + this.suffix);
      this.dialogVisible = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.save-filename-field {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
}
</style>
