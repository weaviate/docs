import reflex as rx

config = rx.Config(
    app_name="tickets",
    show_built_with_reflex=False,
    plugins=[
        rx.plugins.RadixThemesPlugin(
            theme=rx.theme(appearance="light", accent_color="blue", radius="large")
        ),
    ],
    disable_plugins=[rx.plugins.SitemapPlugin],
)
