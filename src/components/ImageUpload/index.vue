<template>
  <el-upload>
    <el-button size="small" type="primary">上传</el-button>
  </el-upload>
</template>

<script>

export default {
  name: 'ImageUpload',
  props: {
    pathPrefix: {
      type: String,
      default: 'path_prefix'
    }
  }
}
</script>
