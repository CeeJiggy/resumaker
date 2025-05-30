import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    IconButton,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { savePreset, deletePreset } from '../services/firestore';
import SavePresetModal from './SavePresetModal';

const Education = ({
    education,
    onUpdate,
    onEducationChange,
    onEducationBlur,
    onAddEducation,
    user,
    presets = [],
    resumeData
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('current');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize selectedPreset from resumeData when presets are loaded
    useEffect(() => {
        if (presets.length > 0) {
            const currentPreset = resumeData.config.selectedPresets?.education || presets[0].name;
            setSelectedPreset(currentPreset);
        } else {
            setSelectedPreset('current');
        }
        setIsLoading(false);
    }, [presets, resumeData.config.selectedPresets]);

    const handleSavePreset = async (presetName) => {
        const preset = {
            name: presetName,
            value: education
        };
        try {
            await savePreset(user.uid, 'education', preset);
            if (onUpdate) {
                onUpdate({ type: 'REFRESH_PRESETS', section: 'education' });
            }
        } catch (error) {
            console.error('Error saving preset:', error);
        }
    };

    const handlePresetSelect = (event) => {
        const presetName = event.target.value;
        setSelectedPreset(presetName);

        const selectedPreset = presets.find(p => p.name === presetName);
        if (selectedPreset) {
            onUpdate({ type: 'UPDATE_EDUCATION', value: selectedPreset.value });
        }
    };

    const handleDeletePreset = async () => {
        if (!selectedPreset || presets.length <= 1) return;

        try {
            await deletePreset(user.uid, 'education', selectedPreset);

            // Select the first available preset after deletion
            const remainingPresets = presets.filter(p => p.name !== selectedPreset);
            if (remainingPresets.length > 0) {
                setSelectedPreset(remainingPresets[0].name);
                onUpdate({ type: 'UPDATE_EDUCATION', value: remainingPresets[0].value });
            }

            onUpdate({ type: 'REFRESH_PRESETS', section: 'education' });
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    const handleEducationChange = (index, field, value) => {
        if (onEducationChange) {
            onEducationChange(index, field, value);
        }
    };

    const handleAddEducation = () => {
        if (onAddEducation) {
            onAddEducation();
        }
    };

    const handleEducationBlur = () => {
        if (onEducationBlur) {
            onEducationBlur();
        }
    };

    const handleDeleteEducation = (index) => {
        const newEducation = education.filter((_, i) => i !== index);
        onUpdate({ type: 'UPDATE_EDUCATION', value: newEducation });
    };

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Typography variant="h6">Education</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Select Preset</InputLabel>
                    <Select
                        value={selectedPreset}
                        onChange={handlePresetSelect}
                        label="Select Preset"
                    >
                        <MenuItem value="current">Current Values</MenuItem>
                        {presets.map((preset) => (
                            <MenuItem key={preset.name} value={preset.name}>
                                {preset.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedPreset && selectedPreset !== 'current' && (
                    <IconButton
                        onClick={handleDeletePreset}
                        disabled={!user || presets.length <= 1}
                        color="error"
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
                <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => setIsModalOpen(true)}
                    disabled={!user}
                >
                    Save as Preset
                </Button>
            </Stack>

            {education.map((edu, index) => (
                <Box key={index} sx={{ mb: 4, position: 'relative' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Institution"
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                onBlur={handleEducationBlur}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Degree"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                onBlur={handleEducationBlur}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Year"
                                value={edu.year}
                                onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                                onBlur={handleEducationBlur}
                            />
                        </Grid>
                    </Grid>
                    <IconButton
                        onClick={() => handleDeleteEducation(index)}
                        sx={{ position: 'absolute', top: -20, right: -20 }}
                        disabled={isLoading}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ))}

            <Button
                startIcon={<AddIcon />}
                onClick={handleAddEducation}
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
            >
                Add Education
            </Button>

            <SavePresetModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePreset}
                existingPresets={presets}
                title="Save Education Preset"
            />
        </Box>
    );
};

export default Education; 