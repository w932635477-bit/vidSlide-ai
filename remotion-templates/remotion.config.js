/**
 * Remotion 配置文件
 */
import { Config } from '@remotion/cli/config';

// 设置视频编码器
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// 设置并发渲染
Config.setConcurrency(4);

// 设置输出质量（使用新的 API）
Config.setJpegQuality(90);
