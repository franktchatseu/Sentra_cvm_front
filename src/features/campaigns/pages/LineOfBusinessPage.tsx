import React from 'react';
import GenericConfigurationPage from '../../../shared/components/GenericConfigurationPage';
import { lineOfBusinessConfig } from '../../../shared/configs/configurationPageConfigs';

export default function LineOfBusinessPage() {
    return <GenericConfigurationPage config={lineOfBusinessConfig} />;
}
