#!/usr/bin/env python3
"""
人脸检测脚本
使用 OpenCV 检测视频中的人脸位置

依赖:
    pip install opencv-python numpy

用法:
    python face_detector.py <video_path> [sample_frames]

输出:
    JSON 格式的人脸位置信息
"""

import cv2
import json
import sys
import numpy as np


def detect_faces_in_video(video_path, sample_frames=5):
    """
    检测视频中的人脸位置

    Args:
        video_path: 视频文件路径
        sample_frames: 采样帧数（检测前N帧的平均位置）

    Returns:
        人脸位置信息 {detected, face: {x, y, width, height, normalized}}
    """
    try:
        # 加载人脸检测器
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )

        # 打开视频
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            return {
                'error': f'无法打开视频文件: {video_path}'
            }

        # 获取视频尺寸
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        faces_detected = []
        frame_count = 0

        # 采样策略：均匀采样整个视频
        sample_interval = max(1, total_frames // sample_frames)

        while frame_count < sample_frames:
            # 跳到采样帧
            frame_pos = frame_count * sample_interval
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)

            ret, frame = cap.read()
            if not ret:
                break

            # 转换为灰度图
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            # 检测人脸
            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            if len(faces) > 0:
                # 取最大的人脸（通常是主讲人）
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                faces_detected.append(largest_face)

            frame_count += 1

        cap.release()

        # 如果没有检测到人脸
        if len(faces_detected) == 0:
            return {
                'detected': False,
                'face': None,
                'videoSize': {
                    'width': frame_width,
                    'height': frame_height
                }
            }

        # 计算平均位置（多帧平均，更稳定）
        avg_face = np.mean(faces_detected, axis=0).astype(int)
        x, y, w, h = avg_face

        # 归一化坐标（0-1）
        return {
            'detected': True,
            'face': {
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h),
                'normalized': {
                    'x': float(x / frame_width),
                    'y': float(y / frame_height),
                    'width': float(w / frame_width),
                    'height': float(h / frame_height)
                }
            },
            'videoSize': {
                'width': frame_width,
                'height': frame_height
            },
            'sampledFrames': len(faces_detected)
        }

    except Exception as e:
        return {
            'error': str(e)
        }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': '请提供视频路径'}))
        sys.exit(1)

    video_path = sys.argv[1]
    sample_frames = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    result = detect_faces_in_video(video_path, sample_frames)
    print(json.dumps(result, ensure_ascii=False))
