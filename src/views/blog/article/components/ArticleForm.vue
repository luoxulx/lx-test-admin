<template>
  <div class="createPost-container">
    <el-form ref="articleForm" :size="nowThemeItemSize" :model="articleForm" :rules="articleRule" class="form-container" label-width="100px">

      <sticky :class-name="'sub-navbar '+articleForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="publishArticle">{{ articleButton }}</el-button>
        <el-button v-loading="loading" type="warning" @click="saveAsDraft">草稿</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="24">

            <el-form-item prop="title" label="标题" class="postInfo-container-item">
              <el-input v-model="articleForm.title" :maxlength="225" required />
            </el-form-item>

            <el-form-item prop="slug" label="slug" class="postInfo-container-item">
              <el-input v-model="articleForm.slug" :maxlength="225" required />
            </el-form-item>

            <el-form-item label="来源" class="postInfo-container-item">
              <el-input v-model="articleForm.source" :maxlength="225" />
            </el-form-item>

            <el-row>
              <el-col :span="8">
                <el-form-item label="分类" class="postInfo-container-item">
                  <el-select v-model="articleForm.category_id" :remote-method="getCategoryList" clearable remote filterable placeholder="请选择分类">
                    <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="标签" class="postInfo-container-item">
                  <el-select v-model="articleForm.tags" :remote-method="getTagList" multiple clearable remote filterable placeholder="请选择标签">
                    <el-option v-for="item in allTags" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="创建时间" class="postInfo-container-item">
                  <el-date-picker :picker-options="createTimeOptions" v-model="articleForm.created_at" type="datetime" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择创建时间" align="right" />
                </el-form-item>
              </el-col>
            </el-row>

          </el-col>
        </el-row>

        <el-form-item label="摘要">
          <el-input :rows="1" v-model="articleForm.description" type="textarea" class="article-textarea" autosize placeholder="请输入摘要"/>
          <span v-show="descriptionLength" class="word-counter">{{ descriptionLength }}字</span>
        </el-form-item>

        <el-form-item label="缩略图">
          <image-upload v-model="thumbnail" />
        </el-form-item>

        <el-form-item prop="content" label="内容">
          <Tinymce ref="articleEditor" :height="400" v-model="articleForm.content" />
        </el-form-item>
      </div>
    </el-form>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import ImageUpload from '@/components/ImageUpload'
import Sticky from '@/components/Sticky' // 粘性header组件
import { articleDetail, articleCreate, articleUpdate, categoryList, tagList } from '@/api'
import { getNowUserInfo } from '@/utils/auth'

const defaultForm = {
  user_id: undefined,
  is_draft: 0,
  category_id: undefined,
  tags: [],
  title: '',
  slug: '',
  source: '',
  description: '',
  thumbnail: '',
  content: '',
  created_at: '',
  id: undefined
}
export default {
  name: 'ArticleForm',
  components: { Tinymce, Sticky, ImageUpload },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message.error(rule.field + '是必填项')
        callback(new Error(rule.field + '是必填项'))
      } else {
        callback()
      }
    }
    return {
      createTimeOptions: [],
      articleForm: Object.assign({}, defaultForm),
      loading: false,
      articleRule: {
        title: [{ validator: validateRequire }],
        slug: [{ validator: validateRequire }]
      },
      tempRoute: {},
      nowThemeItemSize: window.localStorage.getItem('now_theme_size') || 'small',
      articleButton: '发布',
      categories: [],
      allTags: []
    }
  },
  computed: {
    descriptionLength() {
      return this.articleForm.description.length
    },
    lang() {
      return this.$store.getters.language
    }
  },
  created() {
    if (this.isEdit === true) {
      this.articleButton = '更新并发布'
      const id = this.$route.params && this.$route.params.id
      this.fetchArticleData(id)
    } else {
      this.articleForm = Object.assign({}, defaultForm)
    }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
    this.createTimeOptions = [
      {
        text: '今天',
        onClick(picker) { picker.$emit('pick', new Date()) }
      },
      {
        text: '昨天',
        onClick(picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24)
          picker.$emit('pick', date)
        }
      },
      {
        text: '一周前',
        onClick(picker) {
          const date = new Date()
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
          picker.$emit('pick', date)
        }
      }
    ]
  },
  methods: {
    fetchArticleData(id) {
      articleDetail(id).then(response => {
        this.articleForm = response.data.data

        this.articleForm.content = response.data.data.content.html
        if (response.data.data.description === null) {
          this.articleForm.description = ''
        }
        // Set tagsview title
        this.setTagsViewTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = this.lang === 'zh' ? '编辑文章' : 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.articleForm.id}` })
      this.$store.dispatch('updateVisitedView', route)
    },
    publishArticle() {
      // this.articleForm.created_at = parseInt(this.created_at / 1000)
      // this.articleForm.user_id = 1
      const userInfo = getNowUserInfo()
      console.log('cookie user_id: ' + userInfo.user_id)
      this.articleForm.user_id = 1
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.articleForm.is_draft = 0
          if (this.isEdit === false) {
            articleCreate(this.articleForm).then((response) => {
              if (response.data.status === true) {
                this.$message.success('publish successful')
              }
              this.loading = false
              this.$router.push('/blog/article')
            })
          } else if (this.isEdit === true) {
            articleUpdate(this.articleForm).then((response) => {
              if (response.data.status === true) {
                this.$message.success('publish successful')
              }
              this.loading = false
              this.$router.push('/blog/article')
            })
          } else {
            this.$message.error('isEdit\'s value error !')
          }
        }
      })
    },
    saveAsDraft() {
      this.$refs.articleForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.articleForm.is_draft = 1
          if (this.isEdit === false) {
            articleCreate(this.articleForm).then((response) => {
              if (response.data.status === true) {
                this.$message.success('publish successful')
              }
              this.loading = false
              this.$router.push('/blog/article')
            })
          } else if (this.isEdit === true) {
            articleUpdate(this.articleForm).then((response) => {
              if (response.data.status === true) {
                this.$message.success('publish successful')
              }
              this.loading = false
              this.$router.push('/blog/article')
            })
          } else {
            this.$message.error('isEdit\'s value error !')
          }
        }
      })
    },
    getCategoryList(query) {
      categoryList({ name: query }).then(response => {
        if (!response.data) {
          this.$message.warning('please add category first')
        }
        this.categories = response.data.data
      })
    },
    getTagList(query) {
      tagList({ name: query }).then(response => {
        if (!response.data) {
          this.$message.warning('please add tag first')
        }
        this.allTags = response.data.data
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  .createPost-container {
    position: relative;
    .createPost-main-container {
      padding: 40px 45px 20px 50px;
      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;
        .postInfo-container-item {
          float: left;
        }
      }
    }
    .word-counter {
      width: 40px;
      position: absolute;
      right: -10px;
      top: 0px;
    }
  }
</style>
