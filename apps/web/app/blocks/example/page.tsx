import { data } from "../../../lib/navigation";

export default function Page() {
    const components = data.docs.map(group => group.items).flat().map(item => {
        const parts = item.title.split(" ");
        const name = parts.map(part => part.toLowerCase()).join("-")
        return name
    })

    const componentURLs = components.map(name => `/components/${name}`);
    const docURLs = components.map(name => `/docs/${name}`);

    const componentTitles = data.docs.map(group => group.items).flat().map(item => item.title);

    const componentsData = components.map((name, index) => ({
        name,
        title: componentTitles[index],
        componentURL: componentURLs[index],
        docURL: docURLs[index],
    }))


    const formattedData = componentsData.reduce((acc, curr) => {
        acc[curr.name] = {
            title: curr.title ?? "",
            componentURL: curr.componentURL ?? "",
            docURL: curr.docURL ?? "",
        };
        return acc;
    }, {} as Record<string, { title: string; componentURL: string; docURL: string }>);

    return <pre>{JSON.stringify(formattedData, null, 2)}</pre>
}