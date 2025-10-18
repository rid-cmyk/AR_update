import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'list' | 'card' | 'form';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'list',
  count = 3
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
            <Col xs={24} lg={12}>
              <Card title={<Skeleton.Input active size="small" />}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<Skeleton.Input active size="small" />}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          </Row>
        );

      case 'card':
        return (
          <Row gutter={[16, 16]}>
            {Array.from({ length: count }).map((_, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card>
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        );

      case 'form':
        return (
          <Card>
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
            <Skeleton.Button active size="large" style={{ width: 200, marginTop: 16 }} />
          </Card>
        );

      default: // list
        return (
          <Card>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <Skeleton active avatar paragraph={{ rows: 1 }} />
              </div>
            ))}
          </Card>
        );
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;