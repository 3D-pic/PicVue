<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <el-card shadow="hover" class="panel">

      <h2 class="title">3D 立体手书生成器</h2>

      <!-- 上传图片 -->
      <el-upload
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :on-change="onImageChange"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将图片拖到此处，或 <em>点击上传</em>
        </div>
      </el-upload>

      <!-- 参数表单 -->
      <el-form label-width="120px" class="form">
        <el-form-item label="深度增强(分层)">
          <el-slider v-model="settings.depth" :min="0" :max="10"></el-slider>
        </el-form-item>

        <el-form-item label="左右视差">
          <el-slider v-model="settings.parallax" :min="0" :max="100"></el-slider>
        </el-form-item>

        <el-form-item label="动画时长（秒）">
          <el-input-number v-model="settings.duration" :min="1" :max="20"></el-input-number>
        </el-form-item>

        <el-form-item label="相机旋转角度">
          <el-slider v-model="settings.cameraAngle" :min="-50" :max="50"></el-slider>
        </el-form-item>
      </el-form>

      <!-- 图片预览 -->
      <div class="preview" v-if="previewUrl">
        <h3>图片预览</h3>
        <img :src="previewUrl" class="preview-img" />
      </div>

      <!-- 生成按钮 -->
      <el-button
        type="primary"
        class="btn"
        @click="startGenerate"
        :loading="loading"
      >
        🚀 开始生成立体效果
      </el-button>

      <!-- 全屏 Loading -->
      <el-loading :fullscreen="true" lock v-if="loading"></el-loading>

      <!-- 生成进度条 -->
      <div v-if="loading" style="margin-top: 20px;">
        <el-progress :percentage="progress"></el-progress>
      </div>

      <!-- 视频播放器 + 下载 -->
      <div v-if="resultVideo" class="video-container">
        <h3>🎬 生成结果</h3>

        <video :src="resultVideo" controls class="result-video"></video>

        <div style="margin-top: 12px;">
          <el-button
            type="success"
            :loading="downloading"
            @click="downloadVideo"
          >
            ⬇ 下载视频
          </el-button>

          <el-button
            type="info"
            style="margin-left:10px"
            @click="openInNewTab"
          >
            🔗 在新标签打开
          </el-button>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EditorView",

  data() {
    return {
      previewUrl: null,
      resultVideo: null,
      selectedFile: null,

      loading: false,
      progress: 0,

      downloading: false,

      settings: {
        depth: 5,
        parallax: 90,
        duration: 5,
        cameraAngle: 30,
      }
    };
  },

  methods: {
    // 图片预览
    onImageChange(file) {
      this.selectedFile = file.raw;
      this.previewUrl = URL.createObjectURL(file.raw);
    },

    // 生成视频
    async startGenerate() {
      if (!this.selectedFile) {
        this.$message.error("请先上传一张图片！");
        return;
      }

      this.loading = true;
      this.resultVideo = null;
      this.progress = 0;

      const timer = setInterval(() => {
        if (this.progress < 90) this.progress += 1;
      }, 200);

      const formData = new FormData();
      formData.append("file", this.selectedFile);
      formData.append("depth", this.settings.depth);
      formData.append("parallax", this.settings.parallax);
      formData.append("duration", this.settings.duration);
      formData.append("camera_angle", this.settings.cameraAngle);

      try {
        const res = await axios.post(
          "http://localhost:8000/upload_image/",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.video) {
          this.$message.success("生成成功！");
          this.resultVideo = "http://localhost:8000" + res.data.video;
          this.progress = 100;
        } else {
          this.$message.error("生成失败！");
        }
      } catch (e) {
        console.error(e);
        this.$message.error("请求失败，请检查后端服务！");
      }

      clearInterval(timer);
      setTimeout(() => (this.loading = false), 800);
    },

    // 下载视频 —— axios blob
        async downloadVideo() {
        if (!this.resultVideo) return;

        this.downloading = true;

        try {
          // 从 resultVideo 中提取文件名
          const filename = this.resultVideo.split("/").pop();

          const resp = await axios.get(
            `http://localhost:8000/download_video/?filename=${filename}`,
            { responseType: "blob" }
          );

          const blob = new Blob([resp.data], { type: "video/mp4" });
          const downloadUrl = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = filename;
          a.click();

          window.URL.revokeObjectURL(downloadUrl);

          this.$message.success("视频下载成功！");
        } catch (e) {
          console.error(e);
          this.$message.error("下载失败");
        }

        this.downloading = false;
      },

    openInNewTab() {
      if (!this.resultVideo) return;
      window.open(this.resultVideo, "_blank");
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
}

.panel {
  width: 600px;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.upload-area {
  width: 100%;
  margin-bottom: 20px;
}

.preview {
  margin: 20px 0;
  text-align: center;
}

.preview-img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px #ccc;
}

.btn {
  width: 100%;
}

.video-container {
  margin-top: 20px;
  text-align: center;
}

.result-video {
  width: 100%;
  max-width: 480px;
  border-radius: 8px;
  box-shadow: 0 2px 8px #ccc;
}
</style>
