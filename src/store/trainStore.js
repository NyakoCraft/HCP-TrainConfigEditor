import { defineStore } from 'pinia';
import {
  default_train_data,
  default_pretrained_model_options,
  default_prompt_templates
} from '@/constants/index';
import { cloneDeep } from 'lodash-es';
import { handleOptions } from '@/utils';
const trainStorageKey = 'TrainStorage';
const useTrainStore = defineStore('trainStore', {
  state: () => ({
    train: JSON.parse(localStorage.getItem(trainStorageKey)) || cloneDeep(default_train_data),
    train_server_yaml_file: [
      {
        label: 'train_base',
        value: 'train_base'
      },
      {
        label: 'tuning_base',
        value: 'tuning_base'
      },
      {
        label: 'dataset/base_dataset',
        value: 'dataset/base_dataset'
      },
      {
        label: 'dataset/regularization_dataset',
        value: 'dataset/regularization_dataset'
      },
      {
        label: 'examples/add_logger_tensorboard_wandb',
        value: 'examples/add_logger_tensorboard_wandb'
      },
      {
        label: 'examples/controlnet',
        value: 'examples/controlnet'
      },
      {
        label: 'examples/CustomDiffusion',
        value: 'examples/CustomDiffusion'
      },
      {
        label: 'examples/DreamArtist++',
        value: 'examples/DreamArtist++'
      },
      {
        label: 'examples/DreamArtist',
        value: 'examples/DreamArtist'
      },
      {
        label: 'examples/DreamBooth',
        value: 'examples/DreamBooth'
      },
      {
        label: 'examples/fine-tuning',
        value: 'examples/fine-tuning'
      },
      {
        label: 'examples/Lion_optimizer',
        value: 'examples/Lion_optimizer'
      },
      {
        label: 'examples/locon',
        value: 'examples/locon'
      },
      {
        label: 'examples/lora_anime',
        value: 'examples/lora_anime'
      },
      {
        label: 'examples/lora_conventional',
        value: 'examples/lora_conventional'
      },
      {
        label: 'examples/min_snr',
        value: 'examples/min_snr'
      },
      {
        label: 'examples/TextualInversion',
        value: 'examples/TextualInversion'
      }
    ],
    pretrained_model_name_or_path: cloneDeep(default_pretrained_model_options),
    tokenizer_pt_train_name: [],
    default_prompt_templates: cloneDeep(default_prompt_templates)
  }),
  getters: {
    storedTrain() {
      return JSON.parse(localStorage.getItem(trainStorageKey));
    },
    train_server_yaml_file_options() {
      return handleOptions(this.train_server_yaml_file);
    },
    pretrained_model_name_or_path_options() {
      return handleOptions(this.pretrained_model_name_or_path);
    },
    tokenizer_pt_train_name_options() {
      return handleOptions(this.tokenizer_pt_train_name);
    },
    default_prompt_templates_options() {
      return handleOptions(this.default_prompt_templates);
    }
  },
  actions: {
    storageTrain(state) {
      localStorage.setItem(trainStorageKey, JSON.stringify(state));
    }
  }
});

export default useTrainStore;
