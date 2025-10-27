import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { background: 'white', fit: 'contain' },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: '/'
      }
    })
  },
  images: ['public/wplff.svg']
})
