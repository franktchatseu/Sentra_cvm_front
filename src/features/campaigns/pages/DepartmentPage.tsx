import React from 'react';
import GenericConfigurationPage from '../../../shared/components/GenericConfigurationPage';
import { departmentsConfig } from '../../../shared/configs/configurationPageConfigs';

export default function DepartmentPage() {
    return <GenericConfigurationPage config={departmentsConfig} />;
}
