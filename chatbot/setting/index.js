AppSettingsPage({
    build() {
        return Section(
            {
                header: "AI Settings",
            },
            [
                TextInput({
                    label: "Model Name",
                    settingsKey: "modelName",
                    value: "",

                }),


                TextInput({
                    label: "Google API Key",
                    settingsKey: "googleApiKey",
                    value: "",

                }),

                TextInput({
                    label: "Eleventlabs API Key",
                    settingsKey: "elevenlabsApiKey",
                    value: "",

                }),
            ]
        )
    },
})