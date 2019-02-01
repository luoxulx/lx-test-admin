<template>
  <article-form :is-edit="true" />
</template>

<script>
import ArticleForm from './components/ArticleForm'
export default {
  name: 'EditForm',
  components: { ArticleForm }
}
</script>
