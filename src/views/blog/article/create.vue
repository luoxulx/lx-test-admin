<template>
  <article-form :is-edit="false" />
</template>

<script>
import ArticleForm from './components/ArticleForm'
export default {
  name: 'CreateForm',
  components: { ArticleForm }
}
</script>
