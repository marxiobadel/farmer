import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const appName = import.meta.env.VITE_APP_NAME || 'Mon Application';

    return (
        <div className="flex items-center">
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>

            <div className="ml-2 flex-1">
                <span className="block truncate text-md font-semibold leading-tight">
                    {appName}
                </span>
            </div>
        </div>
    );
}
