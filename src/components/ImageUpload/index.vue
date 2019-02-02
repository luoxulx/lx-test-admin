<template>
  <div>
    <el-upload
      :show-file-list="false"
      :on-success="picUploadSuccess"
      :before-upload="picBeforeUpload"
      :on-preview="picClickPreview"
      :on-remove="picClickRemove"
      :on-exceed="picExceedLimit"
      :before-remove="picBeforeRemove"
      :limit="1"
      :accept="picAccept"
      :data="picExtraData"
      action="http://127.0.0.1:8000/api/pic/upload/"
      class="single-pic-upload">
      <img v-if="nowPicThumbnailUrl" :src="nowPicThumbnailUrl" class="small-preview">
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  props: {
    nowPicUrl: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'file'
    },
    picAccept: {
      type: String,
      default: 'file'
    },
    picExtraData: {
      type: Object,
      default: function() {
        return { dir: 'thumbnail' }
      }
    }
  },
  data() {
    return {
      tempUrl: ''
    }
  },
  computed: {
    nowPicThumbnailUrl() {
      return this.nowPicUrl
    }
  },
  methods: {
    picUploadSuccess(file) {
      this.nowPicUrl = file.data.url
    },
    picBeforeUpload(file) {
      const isLt8M = file.size / 1024 / 1024 < 8
      if (!isLt8M) {
        this.$message.error('大小限制 8M！file size：' + file.size)
      }
    },
    picClickRemove(file) {
      console.log(file)
    },
    picClickPreview(file) {
      console.log(file)
    },
    picExceedLimit(file) {
      console.log(file)
    },
    picBeforeRemove(file) {
      return this.$confirm('确定删除? ' + file.name)
    }
  }
}
</script>

<style scoped>
  .small-preview {
    width: 55px;
    height: 55px;
    display: block;
  }
</style>
