import React from 'react';
import GenericConfigurationPage from '../../../shared/components/GenericConfigurationPage';
import { teamRolesConfig } from '../../../shared/configs/configurationPageConfigs';

export default function TeamRolesPage() {
    return <GenericConfigurationPage config={teamRolesConfig} />;
}
