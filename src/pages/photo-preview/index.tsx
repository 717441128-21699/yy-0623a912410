import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const PhotoPreviewPage: React.FC = () => {
  return (
    <View className={styles.pageContainer}>
      <View className={styles.contentCard}>
        <Text className={styles.icon}>🖼️</Text>
        <Text className={styles.title}>照片预览</Text>
        <Text className={styles.subtitle}>功能正在开发中...</Text>
      </View>
    </View>
  );
};

export default PhotoPreviewPage;
