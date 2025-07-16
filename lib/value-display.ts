// UI 값을 실제 API 값으로 표시하는 함수들
export const getDisplayValue = (uiValue: number, settingType: 'stability' | 'similarity_boost' | 'style' | 'speed') => {
  switch (settingType) {
    case 'stability':
    case 'similarity_boost':
    case 'style':
      return (uiValue / 100).toFixed(2);
    case 'speed':
      return (0.7 + (uiValue / 100) * 0.5).toFixed(2);
    default:
      return uiValue.toString();
  }
};