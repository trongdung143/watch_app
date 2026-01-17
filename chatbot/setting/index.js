AppSettingsPage({
    onInit() { settings.settingsStorage.setItem("clear", "0") },
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
                Button({
                    label: "Clear Messages",
                    onClick: () => {
                        if (settings.settingsStorage.getItem("clear") === "0")
                            settings.settingsStorage.setItem("clear", "1")
                    }
                })
            ]
        )
    },
})