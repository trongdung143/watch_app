AppSettingsPage({
    onInit() { },
    build() {
        return Section(
            {
                header: "AI Settings",
            },
            [
                TextInput({
                    label: "Model Name",
                    settingsKey: "modelName",
                    value: "gemini-2.5-flash-lite",
                    placeholder: "gemini-2.5-flash-lite"

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

                TextInput({
                    label: "Server Url",
                    settingsKey: "serverUrl",
                    value: "",
                }),
            ]
        )
    },
})