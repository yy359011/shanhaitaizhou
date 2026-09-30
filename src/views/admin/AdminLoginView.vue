<script setup lang="ts">
/**
 * 后台登录页
 * 原型：admin.html 的 #loginPage（admin / 123456）
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_ACCOUNT, setAdminLoggedIn } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

const form = reactive({ username: '', password: '' })
const showError = ref(false)
let errorTimer: number | undefined

function handleLogin() {
  const username = form.username.trim()
  const password = form.password.trim()

  if (username === ADMIN_ACCOUNT.username && password === ADMIN_ACCOUNT.password) {
    setAdminLoggedIn(true)
    const redirect = route.query.redirect
    router.replace(typeof redirect === 'string' && redirect ? redirect : '/admin/dashboard')
    return
  }

  showError.value = true
  window.clearTimeout(errorTimer)
  errorTimer = window.setTimeout(() => {
    showError.value = false
  }, 3000)
}
</script>

<template>
  <div class="admin-login-page">
    <div class="login-card">
      <div class="login-title">后台管理系统</div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>管理员账号</label>
          <input v-model="form.username" type="text" placeholder="请输入账号" autocomplete="off" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" />
        </div>
        <button type="submit" class="login-btn">登 录</button>
        <div class="login-error" :class="{ show: showError }">账号或密码错误，请重试</div>
      </form>
    </div>
  </div>
</template>
