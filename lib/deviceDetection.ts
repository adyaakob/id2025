export interface DeviceCapabilities {
  hasCamera: boolean;
  isMobile: boolean;
}

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Check if device is mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check if camera is available
  let hasCamera = false;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    hasCamera = devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.warn('Failed to detect camera:', error);
    hasCamera = false;
  }

  return {
    hasCamera,
    isMobile
  };
}
