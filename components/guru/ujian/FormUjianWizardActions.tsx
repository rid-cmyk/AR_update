import React from "react";
import { Space, Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleOutlined } from "@ant-design/icons";
import styles from "./FormUjianWizard.module.css";

interface FormUjianWizardActionsProps {
  currentStep: number;
  stepsLength: number;
  onCancel: () => void;
  handlePrev: () => void;
  handleNext: () => void;
  handleComplete: () => void;
}

export default function FormUjianWizardActions({
  currentStep,
  stepsLength,
  onCancel,
  handlePrev,
  handleNext,
  handleComplete
}: FormUjianWizardActionsProps) {
  return (
    <div className={styles.actionButtons}>
      <Space>
        <Button onClick={onCancel}>
          Batal
        </Button>
        
        {currentStep > 0 && (
          <Button 
            onClick={handlePrev}
            icon={<ArrowLeftOutlined />}
          >
            Sebelumnya
          </Button>
        )}
        
        {currentStep < stepsLength - 1 ? (
          <Button 
            type="primary" 
            onClick={handleNext}
            icon={<ArrowRightOutlined />}
          >
            Selanjutnya
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={handleComplete}
            icon={<CheckCircleOutlined />}
            style={{
              background: '#219ebc',
              border: 'none'
            }}
          >
            Buat Ujian
          </Button>
        )}
      </Space>
    </div>
  );
}
