import React from 'react';
import GenericConfigurationPage from '../../../shared/components/GenericConfigurationPage';
import { campaignObjectivesConfig } from '../../../shared/configs/configurationPageConfigs';

export default function CampaignObjectivesPage() {
    return <GenericConfigurationPage config={campaignObjectivesConfig} />;
}

