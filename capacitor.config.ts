import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.familygather.app',
  appName: 'FamilyGather',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#f7f4ef',
  },
}

export default config
