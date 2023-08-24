import { handleOptions } from '@/utils';
import { defineStore } from 'pinia';
import { getGenerateDir } from '@/api/file';
export default defineStore('common', {
  state: () => ({
    pretrained_model: [
      {
        label: 'stable-diffusion-v1-5',
        value: 'runwayml/stable-diffusion-v1-5'
      },
      {
        label: 'stable-diffusion-v1-4',
        value: 'CompVis/stable-diffusion-v1-4'
      }
    ]
  }),
  getters: {
    pretrained_model_options() {
      return handleOptions(this.pretrained_model);
    }
  },
  actions: {
    async pretrained_model_refresh() {
      return getGenerateDir({ path: 'pretrained_mode' }).then((res) => {
        if (!res) return;
        this.pretrained_model = handleOptions(res.files);
      });
    }
  }
});
