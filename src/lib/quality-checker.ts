export interface QualityCheckResult {
  status: 'passed' | 'warning' | 'failed';
  details: {
    resolution: { status: 'passed' | 'failed'; message: string; value: string };
    brightness: { status: 'passed' | 'warning' | 'failed'; message: string };
    blur: { status: 'passed' | 'warning'; message: string };
    faceDetected: { status: 'passed' | 'failed'; message: string };
    bodyDetected: { status: 'passed' | 'warning' | 'failed'; message: string };
    personCount: { status: 'passed' | 'failed'; message: string; value: number };
  };
  recommendation?: string;
}

export interface ImageQualityChecker {
  analyzeImage(imageBlob: Blob): Promise<QualityCheckResult>;
}

/**
 * Extensible Client-side Image Quality Checker.
 * Performs physical checks (resolution, file size) and handles mock vision checks.
 */
export class ClientImageQualityChecker implements ImageQualityChecker {
  async analyzeImage(imageBlob: Blob): Promise<QualityCheckResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      img.src = url;

      img.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.width;
        const height = img.height;
        const sizeMb = imageBlob.size / (1024 * 1024);

        // 1. Resolution Check
        const resolutionPassed = width >= 512 && height >= 512;
        const resolutionValue = `${width}x${height}px (${sizeMb.toFixed(2)} MB)`;
        const resolutionMsg = resolutionPassed
          ? 'ความละเอียดผ่านเกณฑ์ขั้นต่ำ'
          : 'ความละเอียดต่ำเกินไป (ควรมีขนาดอย่างน้อย 512x512px)';

        // 2. Mock Vision Checks (can be connected to backend APIs / ML models)
        // In this default client-side checker, we simulate realistic vision quality reviews.
        // For demonstration, we assume most user uploads are correct but flag extreme sizes.
        const isExtremelyDark = sizeMb < 0.05; // Dummy logic for dark/empty files
        const brightnessStatus = (isExtremelyDark ? 'failed' : 'passed') as 'passed' | 'warning' | 'failed';
        const brightnessMsg = isExtremelyDark
          ? 'ภาพมืดเกินไป กรุณาเพิ่มแสงสว่าง'
          : 'ระดับความสว่างเพียงพอสำหรับการประมวลผล';

        const blurStatus: 'passed' | 'warning' | 'failed' = sizeMb < 0.1 ? 'warning' : 'passed';
        const blurMsg = blurStatus === 'warning'
          ? 'ภาพมีความเบลอเล็กน้อย ควรระวังความเบลอ'
          : 'ภาพคมชัดดี';

        // Assume face and body are detected for normal files
        const faceDetectedStatus = 'passed';
        const faceDetectedMsg = 'ตรวจพบใบหน้าชัดเจน';

        const bodyDetectedStatus = 'passed';
        const bodyDetectedMsg = 'ตรวจพบโครงสร้างร่างกายครบถ้วน';

        const personCount = 1;
        const personCountStatus = 'passed';
        const personCountMsg = 'ตรวจพบบุคคลเพียง 1 คนตรงตามมาตรฐาน';

        // 3. Formulate Status
        let overallStatus: 'passed' | 'warning' | 'failed' = 'passed';
        let recommendation = '';

        if (!resolutionPassed || brightnessStatus === 'failed' || personCount > 1) {
          overallStatus = 'failed';
          recommendation = 'ไม่ผ่านเกณฑ์: กรุณาถ่ายภาพใหม่ตามแนวทาง Silhouette ในห้องที่มีแสงสว่างเพียงพอ';
        } else if (blurStatus === 'warning' || (brightnessStatus as string) === 'warning') {
          overallStatus = 'warning';
          recommendation = 'ควรปรับปรุง: ภาพสามารถใช้ได้ แต่อาจส่งผลให้ภาพจำลอง AI มีความละเอียดต่ำลงเล็กน้อย';
        } else {
          recommendation = 'ผ่านเกณฑ์มาตรฐาน: ภาพถ่ายมีความพร้อมสูงสำหรับการสร้างแบบจำลองสวมสูทเสมือน';
        }

        resolve({
          status: overallStatus,
          details: {
            resolution: {
              status: resolutionPassed ? 'passed' : 'failed',
              message: resolutionMsg,
              value: resolutionValue,
            },
            brightness: {
              status: brightnessStatus,
              message: brightnessMsg,
            },
            blur: {
              status: blurStatus,
              message: blurMsg,
            },
            faceDetected: {
              status: faceDetectedStatus,
              message: faceDetectedMsg,
            },
            bodyDetected: {
              status: bodyDetectedStatus,
              message: bodyDetectedMsg,
            },
            personCount: {
              status: personCountStatus,
              message: personCountMsg,
              value: personCount,
            },
          },
          recommendation,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          status: 'failed',
          details: {
            resolution: { status: 'failed', message: 'ไม่สามารถโหลดไฟล์รูปภาพได้', value: '0x0' },
            brightness: { status: 'failed', message: 'วิเคราะห์ความสว่างล้มเหลว' },
            blur: { status: 'warning', message: 'วิเคราะห์ความเบลอล้มเหลว' },
            faceDetected: { status: 'failed', message: 'ไม่พบใบหน้า' },
            bodyDetected: { status: 'failed', message: 'ไม่พบร่างกาย' },
            personCount: { status: 'failed', message: 'ระบุจำนวนบุคคลล้มเหลว', value: 0 },
          },
          recommendation: 'ข้อผิดพลาด: ไฟล์ภาพชำรุดหรือไม่ถูกต้อง',
        });
      };
    });
  }
}
