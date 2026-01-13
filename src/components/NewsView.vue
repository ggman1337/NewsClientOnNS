<script lang="ts" setup>
import { ref, computed, onMounted } from "nativescript-vue";
import { fetchNews, type NewsItem } from "../services/newsService";
import { addRecentNews, getRecentNews } from "../services/recentNewsService";

const allNews = ref<NewsItem[]>([]);
const recentNews = ref<NewsItem[]>(getRecentNews());
const loading = ref(false);
const error = ref<string | null>(null);
const offlineMode = ref(false);

const tags = ref<string[]>(["Все"]);
const selectedTagIndex = ref(0);

const useDateFilter = ref(false);
const selectedDate = ref(new Date());

const sortOptions = ref<string[]>(["Сначала новые", "Сначала старые"]);
const selectedSortIndex = ref(0);

const selectedNews = ref<NewsItem | null>(null);
const showFilters = ref(false);
const showRecent = ref(false);
const recentLimit = 5;

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDate(dateKey: string): string {
    const [year, month, day] = dateKey.split("-");
    if (!year || !month || !day) return dateKey;
    return `${day}.${month}.${year}`;
}

function rebuildTags(items: NewsItem[]) {
    const unique = Array.from(new Set(items.map((item) => item.tag))).sort(
        (a, b) => a.localeCompare(b),
    );
    tags.value = ["Все", ...unique];
    selectedTagIndex.value = 0;
}

async function loadNews() {
    loading.value = true;
    error.value = null;
    offlineMode.value = false;

    try {
        const data = await fetchNews();
        allNews.value = data;
        rebuildTags(data);
        recentNews.value = getRecentNews();
    } catch (e) {
        console.error(e);
        const cached = getRecentNews();
        if (cached.length) {
            allNews.value = cached;
            rebuildTags(cached);
            offlineMode.value = true;
        } else {
            error.value = "Не удалось загрузить новости. Проверьте подключение.";
        }
    } finally {
        loading.value = false;
    }
}

function onTagChange(args: any) {
    const picker = args.object as any;
    selectedTagIndex.value = picker.selectedIndex;
}

function onSortChange(args: any) {
    const picker = args.object as any;
    selectedSortIndex.value = picker.selectedIndex;
}

function onDateChange(args: any) {
    const picker = args.object as any;
    selectedDate.value = picker.date;
}

const filteredNews = computed(() => {
    let list = allNews.value.slice();

    const currentTag = tags.value[selectedTagIndex.value] || "Все";
    if (currentTag !== "Все") {
        list = list.filter((item) => item.tag === currentTag);
    }

    if (useDateFilter.value) {
        const selectedKey = toDateKey(selectedDate.value);
        list = list.filter((item) => item.published_at === selectedKey);
    }

    list.sort((a, b) => {
        if (selectedSortIndex.value === 0) {
            return b.published_at.localeCompare(a.published_at);
        }
        return a.published_at.localeCompare(b.published_at);
    });

    return list;
});

function openNews(item: NewsItem) {
    selectedNews.value = item;
    recentNews.value = addRecentNews(item);
}

function onNewsTap(args: any) {
    const item = filteredNews.value[args.index];
    if (item) {
        openNews(item);
    }
}

function closeNews() {
    selectedNews.value = null;
}

function toggleFilters() {
    showFilters.value = !showFilters.value;
}

function toggleRecent() {
    showRecent.value = !showRecent.value;
}

const recentPreview = computed(() => recentNews.value.slice(0, recentLimit));

onMounted(() => {
    loadNews();
});
</script>

<template>
    <Page>
        <ActionBar title="Новостной клиент" />

        <GridLayout rows="auto, *">
            <StackLayout row="0" class="top-panel" v-if="!selectedNews">
                <Label
                    v-if="offlineMode"
                    text="Оффлайн режим"
                    class="offline"
                />

                <GridLayout columns="*, auto">
                    <Label text="Фильтры и сортировка" class="section-title" col="0" />
                    <Button
                        :text="showFilters ? 'Скрыть' : 'Показать'"
                        class="ghost-button"
                        col="1"
                        @tap="toggleFilters"
                    />
                </GridLayout>

                <StackLayout v-if="showFilters" class="mt-2">
                    <StackLayout class="filter-block">
                        <Label text="Тег" class="filter-label" />
                        <ListPicker
                            :items="tags"
                            :selectedIndex="selectedTagIndex"
                            @selectedIndexChange="onTagChange"
                        />

                        <StackLayout
                            orientation="horizontal"
                            class="mt-2"
                            verticalAlignment="center"
                        >
                            <Switch v-model="useDateFilter" />
                            <Label text="Фильтр по дате" class="ml-2" />
                        </StackLayout>

                        <DatePicker
                            :date="selectedDate"
                            :isEnabled="useDateFilter"
                            @dateChange="onDateChange"
                        />
                    </StackLayout>

                    <StackLayout class="mt-2">
                        <Label text="Сортировка" class="filter-label" />
                        <ListPicker
                            :items="sortOptions"
                            :selectedIndex="selectedSortIndex"
                            @selectedIndexChange="onSortChange"
                        />
                    </StackLayout>
                </StackLayout>

                <Label v-if="error" :text="error" class="error mt-2" />

                <StackLayout v-if="recentNews.length" class="mt-2">
                    <GridLayout columns="*, auto">
                        <Label text="Последние открытые" class="section-title" col="0" />
                        <Button
                            :text="showRecent ? 'Скрыть' : 'Показать'"
                            class="ghost-button"
                            col="1"
                            @tap="toggleRecent"
                        />
                    </GridLayout>

                    <StackLayout v-if="showRecent" class="mt-1">
                        <GridLayout
                            v-for="item in recentPreview"
                            :key="item.id"
                            columns="*, auto"
                            class="recent-item"
                            @tap="() => openNews(item)"
                        >
                            <StackLayout col="0">
                                <Label
                                    :text="item.title"
                                    class="item-title"
                                    textWrap="true"
                                />
                                <Label
                                    :text="`${item.tag} - ${formatDate(item.published_at)}`"
                                    class="item-meta"
                                />
                            </StackLayout>
                            <Label col="1" text=">" class="chevron" />
                        </GridLayout>
                    </StackLayout>
                </StackLayout>
            </StackLayout>

            <GridLayout row="1" rows="auto, *">
                <ActivityIndicator
                    :busy="loading"
                    v-if="loading"
                    class="loading-indicator"
                    horizontalAlignment="center"
                    verticalAlignment="center"
                    rowSpan="2"
                />

                <ScrollView v-if="selectedNews && !loading" row="0" rowSpan="2">
                    <StackLayout class="card full-card">
                        <GridLayout columns="*, auto">
                            <Label text="Новость" class="section-title mb-2" col="0" />
                            <Button
                                text="Закрыть"
                                class="close-button"
                                col="1"
                                @tap="closeNews"
                            />
                        </GridLayout>

                        <Label
                            :text="selectedNews.title"
                            class="detail-title mb-1"
                            textWrap="true"
                        />
                        <Image
                            v-if="selectedNews.img_url && !offlineMode"
                            :src="selectedNews.img_url"
                            stretch="aspectFit"
                            class="detail-image mt-2"
                        />
                        <Label
                            :text="`${selectedNews.tag} - ${formatDate(selectedNews.published_at)}`"
                            class="item-meta"
                        />
                        <Label
                            :text="selectedNews.summary"
                            class="mt-2"
                            textWrap="true"
                        />
                        <Label
                            :text="selectedNews.content"
                            class="mt-2"
                            textWrap="true"
                        />
                    </StackLayout>
                </ScrollView>

                <ListView
                    v-if="!loading && !selectedNews && filteredNews.length"
                    :items="filteredNews"
                    @itemTap="onNewsTap"
                    class="news-list"
                    row="1"
                >
                    <template #default="{ item }">
                        <GridLayout columns="*, auto" class="list-item">
                            <StackLayout col="0">
                                <Label
                                    :text="item.title"
                                    class="item-title"
                                    textWrap="true"
                                />
                                <Label
                                    :text="`${item.tag} - ${formatDate(item.published_at)}`"
                                    class="item-meta"
                                />
                                <Label
                                    :text="item.summary"
                                    class="item-summary"
                                    textWrap="true"
                                />
                            </StackLayout>
                            <Label col="1" text=">" class="chevron" />
                        </GridLayout>
                    </template>
                </ListView>

                <StackLayout
                    v-if="!loading && !selectedNews && !filteredNews.length && !error"
                    row="1"
                    verticalAlignment="center"
                    horizontalAlignment="center"
                >
                    <Label
                        text="Нет новостей по выбранным фильтрам."
                        class="mt-4"
                    />
                </StackLayout>
            </GridLayout>
        </GridLayout>
    </Page>
</template>
